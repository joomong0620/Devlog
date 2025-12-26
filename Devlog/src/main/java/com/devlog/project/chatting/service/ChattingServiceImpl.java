package com.devlog.project.chatting.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import org.apache.ibatis.javassist.bytecode.stackmap.BasicBlock.Catch;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.chatting.chatenums.ChatEnums;
import com.devlog.project.chatting.dto.ChattingDTO.FollowListDTO;
import com.devlog.project.chatting.dto.ChattingDTO.GroupCreateDTO;
import com.devlog.project.chatting.dto.ChattingDTO.RoomInfoDTO;
import com.devlog.project.chatting.dto.EmojiDTO;
import com.devlog.project.chatting.dto.MessageDTO;
import com.devlog.project.chatting.dto.ParticipantDTO;
import com.devlog.project.chatting.entity.ChatRoom;
import com.devlog.project.chatting.entity.ChattingUser;
import com.devlog.project.chatting.entity.ChattingUserId;
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
public class ChattingServiceImpl implements ChattingService {

	private final ChattingUserRepository chattingUserRepository;
	private final ChatRoomRepository roomRepository;

	private final ChattingMapper chatMapper;
	private final MemberRepository memberRepository;
	
	private final MessageRepository messageRepository;
	private final EmojiRepository emojiRepository;
	
	
	@Value("${my.chatprofile.location}")
	private String filePath;
	
	@Value("${my.chatprofile.webpath}")
	private String webPath;

	// 채팅방 목록 조회
	@Override
	public List<com.devlog.project.chatting.dto.ChattingDTO.ChattingListDTO> selectChatList(int memberNo) {

		return chatMapper.selectChatList(memberNo);
	}


	// 팔로우 목록 조회
	@Override
	public List<FollowListDTO> selectFollowList(int memberNo) {
		return chatMapper.selectFollowList(memberNo);
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
		
		roomInfo.setRoomName(room.getChattingRoomName());
		roomInfo.setRoomProfile(room.getRoomImg());
		
		
		// 2. 참여 회원 목록
		List<ParticipantDTO> users = chattingUserRepository.findByParticipants(roomNo);
		
		log.info("참여회원 목록 조회 결과 : {}", users);
		
		// 3. 메세지 목록 조회
		// List<MessageDTO> messageList = 
		List<MessageDTO> message = messageRepository.findByMessageList(roomNo, memberNo);
		
		log.info("메세지 목록 조회 결과 : {}", message);
		
		// 3-1 메세지에 달린 이모지 조회
		// 메세지 번호들 꺼내오기
		List<Long> messageNos = message.stream()
					.map(MessageDTO::getMessageNo)
					.toList();
		
		List<EmojiDTO> emojiCount = emojiRepository.findEmojiCount(messageNos);
		
		log.info("이모지 개수 확인 : {}", emojiCount);
		
		
		return null;
	}









}
