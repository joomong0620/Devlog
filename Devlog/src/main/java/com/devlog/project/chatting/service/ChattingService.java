package com.devlog.project.chatting.service;

import java.util.List;

import com.devlog.project.chatting.dto.ChattingDTO;

public interface ChattingService {
	
	
	// 채팅방 목록 조회
	List<ChattingDTO.ChattingListDTO> selectChatList(int memberNo);
	

}
