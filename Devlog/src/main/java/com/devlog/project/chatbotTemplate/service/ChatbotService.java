package com.devlog.project.chatbotTemplate.service;


import org.springframework.stereotype.Service;

import lombok.Getter;
import lombok.Setter;

import org.springframework.ai.openai.*;
import org.springframework.ai.chat.messages.*;
//import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatResponse;
//import org.springframework.ai.openai.api.OpenAiApi.Usage;
//import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.*;

import java.util.*;

@Getter
@Setter
@Service
public class ChatbotService {

    private final OpenAiChatModel chatModel;
    private final Map<String, Integer> tokenMap = new HashMap<>();

    public ChatbotService(OpenAiChatModel chatModel){
        this.chatModel = chatModel;
    }

    public Map<String,Object> sendMessage(String sessionId, String message){
        ChatResponse response = chatModel.call(
                new Prompt(List.of(new UserMessage(message)))
        );

        //String reply = response.getResult().getOutput().getContent(); // Spring AI 0.1.x 이전
        String reply = response.getResult().getOutput().getText(); // Spring AI 0.1.x 이후
        
////        Usage usage = response.getUsage(); // Spring AI 0.1.x 이전
//        OpenAiChatResponseMetadata meta = // Spring AI 0.1.x 이후
//                (OpenAiChatResponseMetadata) response.getMetadata();
//        Usage usage = meta.usage();
        
        

//        int serverTokens = usage.getTotalTokens();
//        tokenMap.put(sessionId, tokenMap.getOrDefault(sessionId,0) + serverTokens);

        return Map.of(
                  "reply", reply,
	              "usage", Map.of(
				              "prompt_tokens", 7, // dummy value for usage.getPromptTokens(),
				              "completion_tokens", 7, // dummy value for usage.getCompletionTokens(),
				              "total_tokens", 7, // dummy value for serverTokens,
				              "accumulated_tokens", 777 // dummy value for tokenMap.get(sessionId)
			            	)
        );
    }

    public Map<String,Object> sendLastAnswer(String sessionId, String question, String answer){

        ChatResponse response = chatModel.call(
                new Prompt(List.of(
                        new UserMessage("이전 질문: "+question),
                        new AssistantMessage("이전 답변: "+answer),
                        new UserMessage("이전 답변을 참고해서 다시 설명해줘.")
                ))
        );

        //String reply = response.getResult().getOutput().getContent();// Spring AI 0.1.x 이전
        String reply = response.getResult().getOutput().getText(); // Spring AI 0.1.x 이후
        //Usage usage = response.getUsage();

//        int serverTokens = usage.getTotalTokens();
//        tokenMap.put(sessionId, tokenMap.getOrDefault(sessionId,0) + serverTokens);

        return Map.of(
                "reply", reply,
                "usage", Map.of(
                        "prompt_tokens", 7, // dummy data for usage.getPromptTokens(),
                        "completion_tokens", 7, // dummy data for usage.getCompletionTokens(),
                        "total_tokens", 7, // dummy data for serverTokens,
                        "accumulated_tokens", 777 //dummy data for tokenMap.get(sessionId)
                )                
        );
    }
}

