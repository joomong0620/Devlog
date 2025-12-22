package com.devlog.project.chatting.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.devlog.project.chatting.dto.ChattingListDTO;
import com.devlog.project.chatting.repository.ChattingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChattingServiceImpl implements ChattingService {
	
	private final ChattingRepository chattingRepository;
	
	
	@Override
	public List<ChattingListDTO> selectChatList(Long memberNo) {
		
		List<ChattingListDTO> list = chattingRepository.selectChatList(memberNo);
		return list;
	}

}
