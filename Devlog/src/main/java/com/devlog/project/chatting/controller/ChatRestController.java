package com.devlog.project.chatting.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.devlog.project.chatting.dto.ChattingDTO;
import com.devlog.project.chatting.service.ChattingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatRestController {
	
	private final ChattingService chattingService;
	
	@GetMapping("/devtalk/chatList")
	public String selectChatList(@RequestParam("memberNo") int memberNo
			, Model model){
		
		
		List<ChattingDTO.ChattingListDTO> chatList = chattingService.selectChatList(memberNo);
		
		log.info("chatList = {}", chatList);
		
		model.addAttribute("chatList", chatList);
		
		return "chatting/chatting ::#roomList";
	}
	
}	
