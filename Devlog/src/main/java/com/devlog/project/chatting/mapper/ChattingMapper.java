package com.devlog.project.chatting.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.devlog.project.chatting.dto.ChattingDTO.ChattingListDTO;

@Mapper
public interface ChattingMapper {
	
	
	// 채팅방 목록 조회
	List<ChattingListDTO> selectChatList(int memberNo);

}
