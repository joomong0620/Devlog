package com.devlog.project.main.controller.websocket;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpSession;

@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest servletRequest) {

            HttpSession session =
                    servletRequest.getServletRequest().getSession(false);

            if (session != null) {

                Long memberNo = (Long) session.getAttribute("memberNo");
                String nickname = (String) session.getAttribute("nickname");
                String profileImg = (String) session.getAttribute("profileImg");

                if (memberNo != null) {
                    attributes.put("memberNo", memberNo);
                    attributes.put("nickname", nickname);
                    attributes.put("profileImg", profileImg);

                    System.out.println("WS Handshake memberNo = " + memberNo);
                }
            }
        }

        return true; 
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
    }
}
