package com.devlog.project.chatbotTemplate.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.devlog.project.chatbotTemplate.service.ChatbotService;

import java.util.Map;

@Controller
@RequestMapping("/api/chatbot/freeboard")
public class FbChatbotController {

    private final ChatbotService chatService;
    
    public FbChatbotController(ChatbotService chatService){ this.chatService = chatService; }

    @GetMapping("page") // chatbotTemplate pop-up window
    public String chatbotTemplatePage() {
    	return "chatbotTemplate/chatbotTemplate";
    }    
    
    @GetMapping("popupBasicChatbot") // chatbot pop-up window (무료버전)
    public String fbChatbotPopupBasicCB() {
    	// BasicChatbot id 넘겨주기
    	return "board/freeboard/fbChatbotBasic";
    }
    
    @GetMapping("popupKongChatbot") // chatbot pop-up window (유료버전)
    public String fbChatbotPopupKongCB() {
    	// KongChatbot id 넘겨주기
    	return "board/freeboard/fbChatbotKong";
    }    
    
    @PostMapping("/{sessionId}")
    @ResponseBody
    public Map<String,Object> chat(@PathVariable  String sessionId, @RequestBody String message){
        return chatService.sendMessage(sessionId, message);
    }

    @PostMapping("/lastAnswer")
    @ResponseBody
    public Map<String,Object> lastAnswer(@RequestBody Map<String,String> payload){
        String sessionId = payload.get("sessionId");
        String question = payload.get("lastQuestion");
        String answer = payload.get("lastAiAnswer");
        return chatService.sendLastAnswer(sessionId, question, answer);
    }
}
