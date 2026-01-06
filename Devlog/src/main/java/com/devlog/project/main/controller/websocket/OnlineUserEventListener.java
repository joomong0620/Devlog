package com.devlog.project.main.controller.websocket;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.context.event.EventListener;
import org.springframework.data.elasticsearch.core.index.AliasAction.Add;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.devlog.project.member.model.dto.FollowDTO;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;

import co.elastic.clients.elasticsearch._types.Result;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class OnlineUserEventListener {

	private final OnlineService onlineService;
	private final MemberRepository memberRepository;
	private final SimpMessageSendingOperations messagingTemplate;
	private static final Map<String, Set<Long>> onlineUsers = new ConcurrentHashMap<>();

	@EventListener
	public void handleWebSocketConnectListener(SessionConnectEvent event) {
		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
		Map<String, Object> attributes = headerAccessor.getSessionAttributes();
		Principal principal = headerAccessor.getUser();
		String memberEmaiil = principal.getName();
		Member member = memberRepository.findMemberNoByMemberEmail(memberEmaiil);

		Long memberNo = member.getMemberNo();
		System.out.println(memberNo);

		onlineUsers.computeIfAbsent("online", k -> ConcurrentHashMap.newKeySet()).add(memberNo);
		System.out.println("현재 온라인 유저들: " + onlineUsers.get("online"));

	}

	@MessageMapping("/requestOnline")
	public void sendFollowList(Map<String, Object> paramMap) {
		Long memberNo = ((Number) paramMap.get("memberNo")).longValue();
		List<FollowDTO> online = onlineService.selectFollow(memberNo);
		System.out.println("팔로우리스트" + online);

		List<FollowDTO> resp = new ArrayList<>();
		Iterator<?> iter = onlineUsers.get("online").iterator();
		while (iter.hasNext()) {
			Long onlineMemberNo = (Long) iter.next();

			for (FollowDTO follow : online) {
				if (follow.getMemberNo().equals(onlineMemberNo)) {
					resp.add(follow);
				}
			}
		}
		System.out.println("온라인 유저 목록" + resp);
		messagingTemplate.convertAndSend("/topic/online/" + memberNo, resp);

	}
	
	
	@EventListener
	public void handleWebSocketDisconnectListenr(SessionDisconnectEvent event) {
		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
		Principal principal = headerAccessor.getUser();
		if (principal == null) return;
		
		
		String memberEmail = principal.getName();
		Member member = memberRepository.findMemberNoByMemberEmail(memberEmail);
		if (member == null) return;
		
		Long memberNo = member.getMemberNo();
		Set<Long> onlineSet = onlineUsers.get("online"); // 현재 온라인 상태로 관리 중인 유저 ID 집합(Set)을 꺼내는 코드
		if (onlineSet != null) {
			onlineSet.remove(memberNo);
		}
	    System.out.println("로그아웃/연결 종료: " + memberNo);
	    System.out.println("현재 온라인 유저들: " + onlineUsers.get("online"));

		
	}
	
}
