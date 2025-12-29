package com.devlog.project.chatting.service;

import java.io.IOException;
import java.util.List;

import com.devlog.project.chatting.dto.ChattingDTO;
import com.devlog.project.chatting.dto.ChattingDTO.GroupCreateDTO;
import com.devlog.project.chatting.dto.ChattingDTO.RoomInfoDTO;
import com.devlog.project.chatting.dto.ParticipantDTO;

public interface ChattingService {
	
	
	// 채팅방 목록 조회
	List<ChattingDTO.ChattingListDTO> selectChatList(Long memberNo, String query);
	
	// 팔로우 목록 조회
	List<ChattingDTO.FollowListDTO> selectFollowList(Long long1);
	
	
	// 개인 채팅방 생성
	Long privateCreate(Long myMemberNo, Long targetMemberNo);
	
	
	// 그룹 채팅방 생성
	Long groupCreate(GroupCreateDTO group, Long myMemberNo) throws IOException;
	
	
	// 채팅방 정보 조회
	RoomInfoDTO roomInfoLoad(Long roomNo, Long memberNo);
	
	
	// 채팅방 마지막 메세지 업데이트
	void updateLastRead(Long roomNo, Long memberNo);
	
	
	
	
	// 채팅방 참여 회원 조회
	List<Long> selectUsers(Long roomNo);
	

}
