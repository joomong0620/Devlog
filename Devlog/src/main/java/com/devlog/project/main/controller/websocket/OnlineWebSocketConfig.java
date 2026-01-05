package com.devlog.project.main.controller.websocket;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OnlineWebSocketConfig {

    private final SimpMessageSendingOperations messagingTemplate;

    // 현재 접속 중인 유저 저장소 (세션ID : 유저정보)
    private static final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Principal(사용자 정보) 추출
        if (headerAccessor.getUser() != null) {
            String sessionId = headerAccessor.getSessionId();
            
            String username = headerAccessor.getUser().getName(); 
            
            // 맵에 저장
            sessionUserMap.put(sessionId, username);
            
            // 모든 접속자에게 "누가 온라인인지" 목록을 쏴줌
            messagingTemplate.convertAndSend("/topic/friends", sessionUserMap.values());
            
            System.out.println("접속 감지: " + username);
        }
    }

    // 기존에 있던 Disconnect 리스너도 유지
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        sessionUserMap.remove(sessionId);
        
        // 나갔을 때도 최신 목록 갱신
        messagingTemplate.convertAndSend("/topic/friends", sessionUserMap.values());
    }
}