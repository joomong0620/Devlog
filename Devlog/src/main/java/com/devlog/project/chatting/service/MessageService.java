package com.devlog.project.chatting.service;

import com.devlog.project.chatting.dto.MessageDTO.ChatMessage;
import com.devlog.project.chatting.dto.MessageDTO.ChatMessageResponse;

public interface MessageService {
	
	
	// 채팅 메세지 삽입
	ChatMessageResponse insertMsg(ChatMessage msg);

}
