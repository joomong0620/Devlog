package com.devlog.project.chatting.service;

import java.io.IOException;
import java.util.List;

import com.devlog.project.chatting.dto.ChattingDTO;
import com.devlog.project.chatting.dto.ChattingDTO.GroupCreateDTO;
import com.devlog.project.chatting.dto.ChattingDTO.RoomInfoDTO;

public interface ChattingService {
	
	
	// 채팅방 목록 조회
	List<ChattingDTO.ChattingListDTO> selectChatList(int memberNo);
	
	// 팔로우 목록 조회
	List<ChattingDTO.FollowListDTO> selectFollowList(int memberNo);
	
	
	// 개인 채팅방 생성
	Long privateCreate(Long myMemberNo, Long targetMemberNo);
	
	
	// 그룹 채팅방 생성
	Long groupCreate(GroupCreateDTO group, Long myMemberNo) throws IOException;
	
	
	// 채팅방 정보 조회
	RoomInfoDTO roomInfoLoad(Long roomNo, Long memberNo);
	

}
