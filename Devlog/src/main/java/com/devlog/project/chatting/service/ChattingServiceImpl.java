package com.devlog.project.chatting.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.ibatis.javassist.bytecode.stackmap.BasicBlock.Catch;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.chatting.chatenums.ChatEnums;
import com.devlog.project.chatting.chatenums.ChatEnums.RoomType;
import com.devlog.project.chatting.chatenums.MsgEnums.MsgType;
import com.devlog.project.chatting.dto.ChattingDTO.FollowListDTO;
import com.devlog.project.chatting.dto.ChattingDTO.GroupCreateDTO;
import com.devlog.project.chatting.dto.ChattingDTO.RoomInfoDTO;
import com.devlog.project.chatting.dto.EmojiDTO;
import com.devlog.project.chatting.dto.MessageDTO;
import com.devlog.project.chatting.dto.MessageDTO.systemMessage;
import com.devlog.project.chatting.dto.ParticipantDTO;
import com.devlog.project.chatting.dto.ParticipantDTO.ChatListUpdateDTO;
import com.devlog.project.chatting.entity.ChatRoom;
import com.devlog.project.chatting.entity.ChattingUser;
import com.devlog.project.chatting.entity.ChattingUserId;
import com.devlog.project.chatting.entity.Message;
import com.devlog.project.chatting.mapper.ChattingMapper;
import com.devlog.project.chatting.repository.ChatRoomRepository;
import com.devlog.project.chatting.repository.ChattingUserRepository;
import com.devlog.project.chatting.repository.EmojiRepository;
import com.devlog.project.chatting.repository.MessageRepository;
import com.devlog.project.common.utility.Util;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@PropertySource("classpath:/config.properties")
public class ChattingServiceImpl implements ChattingService {

	private final ChattingUserRepository chattingUserRepository;
	private final ChatRoomRepository roomRepository;

	private final ChattingMapper chatMapper;
	private final MemberRepository memberRepository;
	
	private final MessageRepository messageRepository;
	private final EmojiRepository emojiRepository;
	
	
	private final SimpMessagingTemplate template;
	
	
	@Value("${my.chatprofile.location}")
	private String filePath;
	
	@Value("${my.chatprofile.webpath}")
	private String webPath;

	// 채팅방 목록 조회
	@Override
	public List<com.devlog.project.chatting.dto.ChattingDTO.ChattingListDTO> selectChatList(Long memberNo, String query) {
		
		log.info("query param = [{}]", query);

		
		if (query == null || query.trim().isEmpty() || "null".equalsIgnoreCase(query)) {
		    return chatMapper.selectChatList(memberNo);
		} else {
		    return chatMapper.selectQueryChatList(memberNo, query.trim());
		}	
	
	}

	
	// 팔로우 목록 조회
	@Override
	public List<FollowListDTO> selectFollowList(Long memberNo,  Long roomNo) {
		
		return chatMapper.selectFollowList(memberNo, roomNo);
	}



	// 개인 채팅방 생성
	@Override
	@Transactional
	public Long privateCreate(Long myMemberNo, Long targetMemberNo) {

		List<Long> memberNos = List.of(myMemberNo, targetMemberNo);

		log.info("myMemberNo={}, targetMemberNo={}", myMemberNo, targetMemberNo);
		// 1. 기존에 채팅방 있는지 조회
		Optional<Long> roomNo = chattingUserRepository.findPrivateRoomNo(myMemberNo, targetMemberNo);

		// 1-1. 조회 결과 있다면 해당 방 번호 반환
		if(roomNo.isPresent()) {
			System.out.println("방 번호 : " + roomNo.get());
			log.info("채팅방 번호 조회 결과 : {}", roomNo.get());
			return roomNo.get();
		}

		// 2. 조회 결과 없을 시 방 생성
		ChatRoom room = ChatRoom.builder()
				.roomType(ChatEnums.RoomType.PRIVATE)
				.build();

		roomRepository.save(room);

		Long roomId = room.getRoomNo();


		// 3. 방 생성 후 유저 삽입
		ChatRoom roomRef = roomRepository.getReferenceById(roomId);

		List<ChattingUser> users = memberNos.stream()
				.map(memberNo -> {
					Member memberRef = memberRepository.getReferenceById(memberNo);

					return ChattingUser.builder()
							.chatUserId(new ChattingUserId())	
							.chattingRoom(roomRef)   // @MapsId("roomNo")
							.member(memberRef)       // @MapsId("memberNo")
							.role(memberNo.equals(myMemberNo) ? ChatEnums.Role.OWNER : ChatEnums.Role.MEMBER)
							.build();
				})
				.toList();

		chattingUserRepository.saveAll(users);

		return roomId;
	}




	// 그룹 채팅방 생성
	@Override
	@Transactional
	public Long groupCreate(GroupCreateDTO group , Long myMemberNo) throws IOException {


		String chatProfile = null;

		try {
			// 파일 이름 추출 
			if(group.getRoomImg() != null && group.getRoomImg().getSize() > 0) {

				chatProfile = saveChatProfile(group.getRoomImg());
			}
			
			// 1. 채팅방 생성
			ChatRoom room = ChatRoom.builder()
					.chattingRoomName(group.getRoomName())
					.roomType(ChatEnums.RoomType.GROUP)
					.roomImg(chatProfile)
					.build();

			roomRepository.save(room);

			Long roomNo = room.getRoomNo();


			// 2. 유저 insert
			ChatRoom roomRef = roomRepository.getReferenceById(roomNo);
			List<ChattingUser> users = group.getMemberNo().stream()
					.map(memberNo -> {
						Member memberRef = memberRepository.getReferenceById(memberNo);

						return ChattingUser.builder()
								.chatUserId(new ChattingUserId())	
								.chattingRoom(roomRef)   // @MapsId("roomNo")
								.member(memberRef)       // @MapsId("memberNo")
								.role(memberNo.equals(myMemberNo) ? ChatEnums.Role.OWNER : ChatEnums.Role.MEMBER)
								.build();
					}).toList();


			chattingUserRepository.saveAll(users);



			return roomNo;
			
		} catch (Exception e) {
			
			if(chatProfile != null) {
				delete(chatProfile);
			}
			
			throw e;
		}
		
	}


	// 이미지 저장 함수

	public String saveChatProfile(MultipartFile img) throws IOException {



		String rename = Util.fileRename(img.getOriginalFilename());

		img.transferTo(new File(filePath + rename));

		return webPath + rename;

	}
	
	// 이미지 삭제 함수
	public void delete(String webPath) {

	    if (webPath == null || webPath.isBlank()) return;
	    
	    
	    String fileName = Paths.get(webPath).getFileName().toString();
	    Path fullPath = Paths.get(filePath, fileName);
	    
	    try {
	        Files.deleteIfExists(fullPath);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}

	
	
	// 채팅방 정보 조회
	@Override
	public RoomInfoDTO roomInfoLoad(Long roomNo, Long memberNo) {
		
		RoomInfoDTO roomInfo = new RoomInfoDTO();
		
		// 1. 채팅방 정보 조회
		ChatRoom room = roomRepository.findById(roomNo)
				.orElseThrow();
		
		if(room.getRoomType() == RoomType.GROUP) {
			roomInfo.setRoomName(room.getChattingRoomName());
			roomInfo.setRoomProfile(room.getRoomImg());
		}else {
			ChattingUser opponent = chattingUserRepository.findOpponent(roomNo, memberNo);
			
			Member opponentMember = opponent.getMember();
			roomInfo.setRoomName(opponentMember.getMemberNickname());
			roomInfo.setRoomProfile(opponentMember.getProfileImg());
		}
		
		
		// 2. 참여 회원 목록
		List<ParticipantDTO> users = chattingUserRepository.findByParticipants(roomNo);
		
		roomInfo.setParticipantCount(users.size());
		// 3. 메세지 목록 조회
		// List<MessageDTO> messageList = 
		List<MessageDTO> message = messageRepository.findByMessageList(roomNo, memberNo);
		
		
		
		// 3-1 메세지에 달린 이모지 조회
		// 메세지 번호들 꺼내오기
		List<Long> messageNos = message.stream()
					.map(MessageDTO::getMessageNo)
					.toList();
		
		List<EmojiDTO> emojiCount = emojiRepository.findEmojiCount(messageNos);
		
		
		Map<Long, Map<String, Long>> reactionMap = new HashMap<>();
		
		for (EmojiDTO emojiDTO : emojiCount) {
			
			Long messageNo = emojiDTO.getMessageNo();
			String emoji = emojiDTO.getEmoji();
			Long count = emojiDTO.getCount();
			
			if(!reactionMap.containsKey(messageNo)) {
				reactionMap.put(messageNo, new HashMap<>());
			}
			// 4 : {❤️ : 1, 😠 : 1}
			
			Map<String, Long> emojiMap = reactionMap.get(messageNo);
			
			emojiMap.put(emoji, count);
		}
		
		// 메세지 dto에 추가
		for (MessageDTO msg : message) {
			Long msgNo = msg.getMessageNo();
			
			Map<String, Long> reactions;
			
			if(reactionMap.containsKey(msgNo)) {
				
				reactions = reactionMap.get(msgNo);
			}else {
				reactions = new HashMap<>();
			}
			// ❤️ : 1, 😠 : 1}
			msg.setReactions(reactions);
			
		}
		
		
		roomInfo.setUsers(users);
		roomInfo.setMessageList(message);
		
		// 최종 확인
		log.info("최종 조회 결과 : {}", roomInfo);
		
		return roomInfo;
	}

	
	
	// 마지막으로 읽은 메세지 업데이트
	@Override
	@Transactional
	public void updateLastRead(Long roomNo, Long memberNo) {
		
		
		log.info("roomNo : {}", roomNo);
		log.info("memberNo : {}", memberNo);
		
		chattingUserRepository.updateLastReadMessageNo(roomNo, memberNo);
	}


	
	
	
	// 채팅방 참여회원 번호 조회
	@Override
	public List<Long> selectUsers(Long roomNo) {
		
		return chattingUserRepository.selectUsers(roomNo);
	}

	
	
	// 채팅방 나가기
	@Override
	@Transactional
	public void roomExit(Long roomNo, Long memberNo) {
		
		ChattingUserId id = new ChattingUserId(roomNo, memberNo);
		
		System.out.println("복합키 확인 id : " + id); 
		
		// 아이디 존재하는지 확인 존재하지 않으면 종료
		if (!chattingUserRepository.existsById(id)) {
	        return;
	    }
		
		
		ChatRoom room = roomRepository.findById(roomNo)
				.orElseThrow();
		
		Member admin = memberRepository.findById(0l)
					.orElseThrow();
		
		// 1. 사용자 닉네임 조회
		Member member = memberRepository.findById(memberNo)
				.orElseThrow();
		String memberNickname = member.getMemberNickname();
		
		// 2. 시스템 메세지 저장
		Message message = Message.builder()
				.chattingRoom(room)
				.messageContent(memberNickname +"님이 나갔습니다.")
				.type(MsgType.SYSTEM)
				.member(admin)
				.build();
		
		messageRepository.save(message);
		
		// 3. 채팅방 나가기
		chattingUserRepository.deleteById(id);
		
		MessageDTO.systemMessage system = systemMessage.builder()
										.content(message.getMessageContent())
										.type(message.getType())
										.build();
		
		template.convertAndSend(
				"/topic/room/" + room.getRoomNo(),
				system
				);
		
		
		
	}

	
	









}
