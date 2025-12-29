package com.devlog.project.chatting.service;

import com.devlog.project.chatting.dto.MessageDTO.ChatMessage;
import com.devlog.project.chatting.dto.MessageDTO.ChatMessageResponse;
import com.devlog.project.chatting.dto.MessageDTO.MessageEdit;

public interface MessageService {
	
	
	// 채팅 메세지 삽입
	ChatMessageResponse insertMsg(ChatMessage msg);
	
	// 안 읽은 메세지 계산
	Long countUnreadMsg(Long memberNo, Long roomNo);
	
	
	// 메세지 수정
	void editMessage(MessageEdit editDto);

}
