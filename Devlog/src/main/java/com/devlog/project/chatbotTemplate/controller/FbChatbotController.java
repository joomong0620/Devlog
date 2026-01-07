package com.devlog.project.chatbotTemplate.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.devlog.project.chatbotTemplate.service.CbtTokenUsageService;
import com.devlog.project.chatbotTemplate.service.ChatbotService;
import com.devlog.project.member.model.dto.MemberLoginResponseDTO;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/api/chatbot/freeboard")
public class FbChatbotController {

    private final ChatbotService chatService;
    
    public FbChatbotController(ChatbotService chatService){ this.chatService = chatService; }


    @GetMapping("page") // chatbotTemplate pop-up window
    public String chatbotTemplatePage() {
    	return "chatbotTemplate/chatbotTemplate";
    }    
    
    
    // 챗봇 팝업차 화면 보여주기 
    @GetMapping("popupBasicChatbot") // chatbot pop-up window (무료버전)
    public String fbChatbotPopupBasicCB(Model model) {
    	// BasicChatbot id 넘겨주기
        model.addAttribute("chatbotId", "BASIC"); // 기본형 챗봇
        model.addAttribute("chatbotType", "free");
        model.addAttribute("cbtProfileImg", "/images/board/freeboard/chatbot1.png");
        
    	return "board/freeboard/fbChatbotRevBasic"; // 커피콩 챗봇
    }
    
    @GetMapping("popupKongChatbot") // chatbot pop-up window (유료버전)
    public String fbChatbotPopupKongCB(Model model) {
    	// KongChatbot id 넘겨주기
        model.addAttribute("chatbotId", "KONG");
        model.addAttribute("chatbotType", "beanCharge");
        model.addAttribute("cbtProfileImg", "/images/board/freeboard/chatbot3.png");    	
    	return "board/freeboard/fbChatbotRevKong";
    }    
        
    
//    // [ 과금 작업 draft ] : 토큰 프론트에서 대강계산(4ch/token) + DB에 대이터삽입X
//	@PostMapping("/{sessionId}")
//	@ResponseBody
//	public ResponseEntity<Map<String, Object>>  chat(@PathVariable  String sessionId, @RequestBody String message){
//	    return ResponseEntity.ok(chatService.sendMessage(sessionId, message));
//	}    

    
    // [ 과금 작업 using meta-data ] : 토큰 백엔트에서 제대로(openAI meta data 이용) + DB에 대이터삽입O
    /**
     * 챗봇 메시지 처리 (토큰 사용량 기록 포함)
     * @param sessionId 세션ID
     * @param userMessage 사용자 메시지
     * @param session HTTP 세션
     * @return 챗봇 응답
     */
    @PostMapping("/{sessionId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> chat(
    		@PathVariable  String sessionId, 
    		@RequestBody String userMessage,
    		@SessionAttribute(name = "loginMember", required = false) MemberLoginResponseDTO loginMember, // 로그인시 Session에 저장된 loginMember 가져오기
    		HttpSession session 
    		){
    	
        log.info("챗봇 요청 - 세션ID: {}, 회원번호: {}, 메시지: {}", 
                sessionId, loginMember != null ? loginMember.getMemberNo() : "비회원", userMessage);
    	
        Map<String, Object> result = new HashMap<>(); // 챗봇의 응답을 담는 객체
        try {
        	
        	// OpenAI API 서비스 호출: [ 과금 작업 draft ]
        	// result = chatService.sendMessage(String sessionId, String message)
        	
        	// OpenAI API 서비스 호출:  [ 과금 작업, meta-data ]
        	result = chatService.sendMessageTokenInfo(sessionId, userMessage, loginMember);
        	
        } catch (Exception e) {
            log.error("챗봇 처리 중 오류 발생", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("reply", "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    	
    	return ResponseEntity.ok(result);
    }

    
    /**
     * 회원의 토큰 사용량 조회
     * @param loginMember
     * @return 토큰 사용량 정보
     */
    @GetMapping("/usage")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getUsage(
            @SessionAttribute(name = "loginMember", required = false) MemberLoginResponseDTO loginMember) {
        
        if(loginMember == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }
        
        Map<String, Object> result = new HashMap<>(); 
        result = chatService.getUsagebyMember(loginMember);
        
        return ResponseEntity.ok(result);
        
    }
    
    
    
    
      // 일단 이건 지금 쓰지말자
//    @PostMapping("/lastAnswer")
//    @ResponseBody
//    public Map<String,Object> lastAnswer(@RequestBody Map<String,String> payload){
//        String sessionId = payload.get("sessionId");
//        String question = payload.get("lastQuestion");
//        String answer = payload.get("lastAiAnswer");
//        return chatService.sendLastAnswer(sessionId, question, answer);
//    }
        
        
}
