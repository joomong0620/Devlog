package com.devlog.project.chatting.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.devlog.project.chatting.dto.ChattingDTO;
import com.devlog.project.chatting.dto.ChattingDTO.ChattingListDTO;
import com.devlog.project.chatting.service.ChattingService;
import com.devlog.project.common.utility.Util;
import com.devlog.project.member.model.dto.MbMember;
import com.devlog.project.member.model.dto.MemberLoginResponseDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatRestController {
	
	private final ChattingService chattingService;
	
	// 채팅방 목록 조회
	@GetMapping("/devtalk/chatList")
	public String selectChatList(
			Model model,
			@SessionAttribute("loginMember") MemberLoginResponseDTO loginMember){
		
		int memberNo = 1;
		
		List<ChattingDTO.ChattingListDTO> chatList = chattingService.selectChatList(loginMember.getMemberNo());
		
		for (ChattingListDTO dto : chatList) {
			dto.setFormatTime(Util.formatChatTime(dto.getLastMessageAt()));
			
		}
		
		log.info("chatList = {}", chatList);
		
		model.addAttribute("chatList", chatList);
		
		return "chatting/chatting ::#roomList";
	}
	
	
	// 회원 초대할 팔로우 목록 조회
	@GetMapping("/devtalk/followSelect")
	public String selectFollowList(
			// 세션 로그인 멤버
			@SessionAttribute("loginMember") MemberLoginResponseDTO loginMember,
			Model model
			) {
		
		
		
		List<ChattingDTO.FollowListDTO> followList = chattingService.selectFollowList(loginMember.getMemberNo());
		
		log.info("팔로우 리스트 조회 결과 : {} ", followList);
		
		model.addAttribute("followList", followList);
		
		return "chatting/chatting ::#chatFollowList";
	}
	
	
	// 개인 채팅방 생성
	@PostMapping("/devtalk/create/private")
	@ResponseBody
	public Long privateCreate(
			@RequestBody Long targetMemberNo,
			@SessionAttribute("loginMember") MemberLoginResponseDTO loginMember
			) {
		Long myMemberNo = loginMember.getMemberNo();
		
		log.info("myMemberNo={}, targetMemberNo={}", myMemberNo, targetMemberNo);
		
		return chattingService.privateCreate(myMemberNo, targetMemberNo);
	}
	
	
	// 그룹 채팅방 생성
	@PostMapping("/devtalk/create/group")
	@ResponseBody
	public Long gropuCreate(
			@ModelAttribute ChattingDTO.GroupCreateDTO group,
			@SessionAttribute("loginMember") MemberLoginResponseDTO loginMember
			) throws IOException {
		
		log.info("파라미터 확인 group : {}", group);
		
		Long loginMemberNo = loginMember.getMemberNo();
		
		group.getMemberNo().add(0, loginMemberNo);
		
		
		
		return chattingService.groupCreate(group, loginMemberNo);
	}
	
	
	// 해당 채팅방 정보 조회
	@GetMapping("/devtalk/roomInfoLoad")
	public String roomInfoLoad(
			@RequestParam("roomNo") Long roomNo,
			@SessionAttribute("loginMember") MemberLoginResponseDTO loginMember,
			Model model) {
		
		Long memberNo = loginMember.getMemberNo();
		
		ChattingDTO.RoomInfoDTO roomInfo = chattingService.roomInfoLoad(roomNo, memberNo);
		
		model.addAttribute("roomInfo", roomInfo);
		
		
		return "chatting/chatting ::#chatting-space";
		
	}
	
	
}	
