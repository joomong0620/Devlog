package com.devlog.project.chatbotTemplate.controller;


import org.springframework.web.bind.annotation.*;

import com.devlog.project.chatbotTemplate.service.ChatbotService;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    private final ChatbotService chatService;
    public ChatbotController(ChatbotService chatService){ this.chatService = chatService; }

    @PostMapping("/{sessionId}")
    //public Map<String,Object> chat(@PathVariable("sessionId")  String sessionId, @RequestBody String message){
    public Map<String,Object> chat(@PathVariable  String sessionId, @RequestBody String message){
        return chatService.sendMessage(sessionId, message);
    }

    @PostMapping("/lastAnswer")
    public Map<String,Object> lastAnswer(@RequestBody Map<String,String> payload){
        String sessionId = payload.get("sessionId");
        String question = payload.get("lastQuestion");
        String answer = payload.get("lastAiAnswer");
        return chatService.sendLastAnswer(sessionId, question, answer);
    }
}