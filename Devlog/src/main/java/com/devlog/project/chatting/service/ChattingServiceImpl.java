package com.devlog.project.chatting.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.devlog.project.chatting.dto.ChattingListDTO;
import com.devlog.project.chatting.mapper.ChattingMapper;
import com.devlog.project.chatting.repository.ChattingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChattingServiceImpl implements ChattingService {
	
	private final ChattingRepository chattingRepository;
	private final ChattingMapper chatMapper;
	
	
	@Override
	public List<ChattingListDTO> selectChatList(int memberNo) {
		
		List<Object[]> list = chattingRepository.selectChatList(memberNo);
		
		System.out.println(list);
		
		return null;
	}

}
