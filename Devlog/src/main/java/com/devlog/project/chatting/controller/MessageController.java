package com.devlog.project.chatting.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.devlog.project.chatting.dto.MessageDTO;
import com.devlog.project.chatting.dto.MessageDTO.ChatMessageResponse;
import com.devlog.project.chatting.dto.ParticipantDTO.ChatListUpdateDTO;
import com.devlog.project.chatting.service.ChattingService;
import com.devlog.project.chatting.service.MessageService;
import com.devlog.project.member.model.dto.MemberLoginResponseDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class MessageController {
	
	private final SimpMessagingTemplate templete;
	
	private final MessageService service;
	
	private final ChattingService chatService;
	
	private final Map<Long, Set<Long>> roomViewers = new ConcurrentHashMap<>();
	
	
	@MessageMapping("/chat.send")
	public void send(@Payload MessageDTO.ChatMessage msg) {
		// @Payload : STOMP 메시지의 body 부분을 이 파라미터에 직접 매핑
		
		log.info("보낸 메세지 확인 : {}", msg);
		
		
		ChatMessageResponse res = service.insertMsg(msg);
		
		int totalViewers = msg.getTotalCount();
		int onlineViewers = roomViewers.getOrDefault(msg.getChatRoomNo(), Set.of()).size();
		
		res.setUnreadCount(totalViewers-onlineViewers);
		templete.convertAndSend(
				"/topic/room/" + res.getRoomNo(),
				res
				);
		
		
		
		List<Long> memberNos = chatService.selectUsers(res.getRoomNo());
		
		log.info("회원 번호 조회 결과 : {}", memberNos);
		
		for (Long memberNo : memberNos) {
			
			ChatListUpdateDTO updateDto = new ChatListUpdateDTO(); 
			
			updateDto.setLastMessage(res.getContent());
			updateDto.setSendtime(res.getSendtime());
			updateDto.setRoomNo(res.getRoomNo());
			updateDto.setUnreadCount(service.countUnreadMsg(memberNo, res.getRoomNo()));
			
			log.info("채팅방 업데이트용 DTO 확인 : {}", updateDto);
			templete.convertAndSend( "/topic/chat-list/" + memberNo,
					updateDto);
		}
		
		 
		log.info("msg 응답 확인 : {}", res);
		
	}
	
	
	@MessageMapping("/chat.read")
	public void messageRead(@Payload MessageDTO.messageReadRequest req) {
		
		System.out.println("req = " + req);
		
		chatService.updateLastRead(req.getRoomNo(), req.getMemberNo());
		
		
	}
	
	@MessageMapping("/chat.enter")
	public void enter(@Payload MessageDTO.messageReadRequest req
	                  ) {

	    roomViewers
	        .computeIfAbsent(req.getRoomNo(), k -> ConcurrentHashMap.newKeySet())
	        .add(req.getMemberNo());
	}
	
	
	@MessageMapping("/chat.leave")
	public void leave(@Payload MessageDTO.messageReadRequest req
	                  ) {

	    Set<Long> viewers = roomViewers.get(req.getRoomNo());
	    if (viewers != null) {
	        viewers.remove(req.getMemberNo());
	    }
	}


	

}
