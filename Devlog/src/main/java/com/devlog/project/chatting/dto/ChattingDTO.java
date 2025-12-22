package com.devlog.project.chatting.dto;

import java.time.LocalDateTime;

public class ChattingDTO {
	
	
	public static class Response {
		
		private Long chattingRoomNo;
		private String lastMessage;
		private LocalDateTime lastMessageAt;
		
	}
}
