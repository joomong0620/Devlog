package com.devlog.project.chatting.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devlog.project.chatting.dto.ChattingListDTO;
import com.devlog.project.chatting.service.ChattingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ChatRestController {
	
	private final ChattingService chattingService;
	
	@GetMapping("/devtalk/chatList")
	public List<ChattingListDTO> selectChatList(){
		
		int memberNo = 1;
		
		List<ChattingListDTO> chatList = chattingService.selectChatList(memberNo);
		
		log.info("chatList = {}", chatList);
		
		return null;
	}
	
}	
