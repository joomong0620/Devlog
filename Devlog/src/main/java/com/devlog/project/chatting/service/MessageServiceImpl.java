package com.devlog.project.chatting.service;

import org.springframework.stereotype.Service;

import com.devlog.project.chatting.chatenums.MsgEnums;
import com.devlog.project.chatting.dto.MessageDTO;
import com.devlog.project.chatting.dto.MessageDTO.ChatMessage;
import com.devlog.project.chatting.dto.MessageDTO.ChatMessageResponse;
import com.devlog.project.chatting.entity.ChatRoom;
import com.devlog.project.chatting.entity.Message;
import com.devlog.project.chatting.repository.ChatRoomRepository;
import com.devlog.project.chatting.repository.MessageRepository;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
	
	private final ChatRoomRepository roomRepository;
	private final MessageRepository msgRepository;
	private final MemberRepository memberRepository;
	
	// 메세지 삽입
	@Override
	public ChatMessageResponse insertMsg(ChatMessage msg) {
		
		ChatRoom room = roomRepository.findById(msg.getChatRoomNo())
				.orElseThrow();
		
		Member member = memberRepository.findById(msg.getSender())
				.orElseThrow();
		
		
		
		Message message = Message.builder()
				.chattingRoom(room)
				.member(member)
				.messageContent(msg.getContent())
				.type(MsgEnums.MsgType.TEXT)
				.build();
		
		message = msgRepository.save(message);
		
		
		
		return MessageDTO.ChatMessageResponse.toDto(message);
	}
	
	
	// 안 읽은 메세지 계산
	@Override
	public Long countUnreadMsg(Long memberNo, Long roomNo) {
		return msgRepository.countUnreadMsg(memberNo, roomNo);
	}

}
