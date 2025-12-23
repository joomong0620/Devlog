package com.devlog.project.chatting.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.devlog.project.chatting.mapper.ChattingMapper;
import com.devlog.project.chatting.repository.ChattingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChattingServiceImpl implements ChattingService {
	
	private final ChattingRepository chattingRepository;
	private final ChattingMapper chatMapper;
	
	
	
	// 채팅방 목록 조회
	@Override
	public List<com.devlog.project.chatting.dto.ChattingDTO.ChattingListDTO> selectChatList(int memberNo) {
		
		return chatMapper.selectChatList(memberNo);
	}
	
	

}
