package com.devlog.project.chatbotTemplate.service;


import org.springframework.stereotype.Service;

import com.devlog.project.chatbotTemplate.dto.CbtTokenUsage;
import com.devlog.project.member.model.dto.MemberLoginResponseDTO;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import org.springframework.ai.openai.*;
import org.springframework.http.ResponseEntity;
//import org.springframework.ai.openai.OpenAiChatModel
//import org.springframework.ai.openai.api.OpenAiApi.ChatCompletionRequest.ResponseFormat;
import org.springframework.ai.chat.messages.*;

//import org.springframework.ai.openai.api.OpenAiApi.Usage; // 이거? => Spring AI 내부에서 OpenAI API 바인딩용 DTO라서 ChatResponse에서 직접 꺼내 쓸 수 있는 타입이 아니다.
import org.springframework.ai.chat.metadata.Usage; // 아니면 이거 써야함

//import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.*;
//import org.springframework.ai.chat.prompt.Prompt;

import java.util.*;

@Slf4j
@Getter
@Setter
@Service
public class ChatbotService {

    private final OpenAiChatModel chatModel;
    private final CbtTokenUsageService cbtTokenUsageService;
    
    private final Map<String, Integer> tokenMap = new HashMap<>();

    public ChatbotService( // RequiredArgs 생성자로 이게 @RequiredArgsConstructor 어노테이션 붙여준거랑 같다
    		OpenAiChatModel chatModel,
    		CbtTokenUsageService cbtTokenUsageService
    		){ 
    	this.chatModel = chatModel; 
    	this.cbtTokenUsageService = cbtTokenUsageService; 
    	}
    

    /////// [ 과금 작업 draft ] : 토큰 프론트에서 대강계산(4ch/token) + DB에 대이터삽입X
    public Map<String,Object> sendMessage(String sessionId, String message){
        ChatResponse response = chatModel.call(
                new Prompt(List.of(new UserMessage(message)))
        );

        String reply = response.getResult().getOutput().getText(); // Spring AI 0.1.x 이후
                
        Usage usage = response.getMetadata().getUsage();
        int promptTokens = usage != null ? Math.toIntExact(usage.getPromptTokens()) : 0;
        int completionTokens = usage != null ? Math.toIntExact(usage.getCompletionTokens()) : 0;
        int totalTokens = usage != null ? Math.toIntExact(usage.getTotalTokens()) : 0;
        
        long accumulatedTokens =
        		cbtTokenUsageService.accumulate(
        		sessionId,
        		totalTokens
        		);
        log.info("토큰 사용량 - Prompt: {}, Completion: {}, Total: {}, AccumulatedTokens: {}", 
                promptTokens, completionTokens, totalTokens, accumulatedTokens);
        
        int calcBeansTotal = cbtTokenUsageService.calculateBeans(totalTokens);
        int accumulated_usedBeans = cbtTokenUsageService.calculateBeans(totalTokens);
        log.info("토큰2Beans - Total: {}, accumulated_usedBeans: {}", 	calcBeansTotal, accumulated_usedBeans);   
        
        
        return Map.of(
                "reply", reply,
	              "usage", Map.of(
				              "prompt_tokens", promptTokens, 
				              "completion_tokens", completionTokens, 
				              "total_tokens", totalTokens, 
				              "accumulated_tokens", accumulatedTokens, 
				              "accumulated_usedBeans", accumulated_usedBeans
	            		  		)
	              	);     
    }
    
    
    
    
    

    /////// [ 과금 작업 using meta-data ]: 토큰 백엔트에서 제대로(openAI meta data 이용) + DB에 대이터삽입O
    // ==> 과금은 토큰 usage메타데이터, 직접 토큰 추정 or OpenAI billing API 사용해서 하는 3가지 방법이 있을수 있음
	/** 챗봇 메시지 처리 (토큰 사용량 기록 포함)
	 * @param sessionId 세션ID
	 * @param userMessage 사용자 메시지
	 * @param loginMember
	 * @return 챗봇응답 및 토큰사용info
	 */
	public Map<String, Object> sendMessageTokenInfo(String sessionId, String userMessage,
			MemberLoginResponseDTO loginMember) {
		
        log.info("챗봇 요청 - 세션ID: {}, 회원번호: {}, 메시지: {}", 
                sessionId, loginMember != null ? loginMember.getMemberNo() : "비회원", userMessage);
        
        try {
            // 시스템 프롬프트 생성 (BASIC/KONG 타입별 차이)
            //String systemPrompt = createSystemPrompt(session.getCbSessionType()); // prompt engineering
            String systemPrompt = createSystemPrompt("BASIC"); // 테스트용, 현재는 모두 BASIC으로
        	
        	// OpenAI API 호출
            Prompt prompt = new Prompt(systemPrompt + "\n\n사용자 질문: " + userMessage); // ChatbotService 에서
            ChatResponse response = chatModel.call(prompt); // ChatbotService 에서 (chatModel <- OpenAiChatModel)
            
            String aiAnswer = response.getResult().getOutput().getText(); // Spring AI 0.1.x 이후
            
            // 토큰 사용량 정보 가져오기 
			// 아래 모두 ChatbotService에서
            Usage usage = response.getMetadata().getUsage();
            int promptTokens = usage != null ? Math.toIntExact(usage.getPromptTokens()) : 0;
            int completionTokens = usage != null ? Math.toIntExact(usage.getCompletionTokens()) : 0;
            int totalTokens = usage != null ? Math.toIntExact(usage.getTotalTokens()) : 0;
            
            /////////////////////////////////////////
            long accumulatedTokens = cbtTokenUsageService.accumulate(sessionId,	totalTokens);
            log.info("토큰 사용량 - Prompt: {}, Completion: {}, Total: {}, AccumulatedTokens: {}", 
                    promptTokens, completionTokens, totalTokens, accumulatedTokens);
            
            int calcBeansTotal = cbtTokenUsageService.calculateBeans(totalTokens);
            int accumulated_usedBeans = cbtTokenUsageService.calculateBeans(totalTokens);
            log.info("토큰2Beans - Total: {}, accumulated_usedBeans: {}", 	calcBeansTotal, accumulated_usedBeans);               
            
            // 토큰 사용량 DB 저장 (로그인한 회원만, 어차피 비회원은 chatbot 못쓴다 b/c 글작성, 글수정이 원천봉쇄되어 있으므로) 
			// 아래 모두 ChatbotService에서 
            if(loginMember != null) {
                // 세션ID를 숫자로 변환 (실제로는 CB_SESSION 테이블에서 가져와야 함)
                Long cbSessionId = parseCbSessionId(sessionId);
				
//                // 사용한 토큰(과금할 커피콩)에 대한 정보 저장 
//                // => 사용 커피콩(BeanSwe) 계산은 이 메소드 안에서 수행 (500토큰당 1커피콩:실제, 5토큰당 1커피콩:테스트용)
//                //tokenUsageService.saveTokenUsage( 
//                CbtTokenUsage tokenUsage = cbtTokenUsageService.saveTokenUsage( // CB_TOKEN_USAGE 에 삽입	
//                    userMessage,
//                    aiAnswer,
//                    promptTokens,
//                    completionTokens,
//                    "gpt-4o-mini",  // 모델명
//                    loginMember.getMemberNo(),
//                    cbSessionId
//                );
//                
                
				// 회원의 현재 잔여콩 확인: (MemberLoginResponseDTO에 업데이트 된 BeansAmount값 읽어오기)
                int currentBeans = cbtTokenUsageService.getRemainingBeans(
                    loginMember.getMemberNo(), 
                    loginMember.getBeansAmount() != null ? loginMember.getBeansAmount() : 0
                );
                log.info("회원 {} 잔여 커피콩: {}", loginMember.getMemberNo(), currentBeans);
				
				// [추가] 여기에 사용한 커피콩을 현재 유저의 커피콩에서 빼는 로직 필요.				
				if (currentBeans < accumulated_usedBeans){ // 커피콩을 다 사용한 경우
									// //===>  회원의 현재 잔여 커피콩 계산
					// 누적 사용커피콩 += 현재사용 커피콩 
					// 이때 차감커피콩 = 현재커피콩 - 누적 사용커피콩 > 0이면 계속 진행하면서 사용커피콩은 계속 누적으로 관리
					// (case1) 만약 차감커피콩 < 0 이면, 사용중지하고 커피콩 충전후 사용하라는 경고창 보여주고, 
					// 현 세션 종료하고 ==> CB_SESSION 테이블에 현 세션 정보 데이터 입력, 
					//               ==> COFFEE_BEANS_TRADE에 콩사용 내역기록
					//               ==> Member BeansAmount 업데이트 
					log.info("회원 {} 현재 콩잔액 = {}, 누적 사용 콩= {} ", loginMember.getMemberNo(), currentBeans, accumulated_usedBeans);
					
				} else { // 아직 커피콩이 남아 있는경우
					// (case2) 사용자가 정상종료(팝어창닫기)하면
					// 세션 종료하고 ==> CB_SESSION 테이블에 현 세션 정보 데이터 입력, 
					//               ==> COFFEE_BEANS_TRADE에 콩사용 내역기록
					//               ==> Member BeansAmount 업데이트 	
					log.info("회원 {} 현재 콩잔액 = {}, 누적 사용 콩= {} ", loginMember.getMemberNo(), currentBeans, accumulated_usedBeans);
					log.info("최종 콩 잔액 = {} (현재콩 잔액 -  누적사용콩)", currentBeans - accumulated_usedBeans);
				}
							
            }
            
            // 응답 생성
            Map<String, Object> result = new HashMap<>();
            result.put("reply", aiAnswer);
            result.put("usage", Map.of(
                "prompt_tokens", promptTokens
                , "completion_tokens", completionTokens
                , "total_tokens", totalTokens
                , "accumulated_tokens", accumulatedTokens
                , "accumulated_usedBeans", accumulated_usedBeans
            ));
            
            return result;
            
        } catch (Exception e) {
            log.error("챗봇 처리 중 오류 발생", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("reply", "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            errorResponse.put("error", e.getMessage());
            return errorResponse;
        }
	}
	
    /**
     * 세션ID 문자열을 Long으로 변환
     * 실제로는 CB_SESSION 테이블에서 조회해야 함
     * @param sessionId
     * @return CB_SESSION_ID
     */
    private Long parseCbSessionId(String sessionId) {
        try {
            // "session2" -> 2
            return Long.parseLong(sessionId.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            log.warn("세션ID 파싱 실패, 기본값 1 사용");
            return 1L;
        }
    }


	/** 
     * 회원의 토큰 사용량 조회
	 * @param loginMember
	 * @return 회원의 토큰 사용량 정보
	 */
	public Map<String, Object> getUsagebyMember(MemberLoginResponseDTO loginMember) {
        
        if(loginMember == null) {
            return Map.of("error", "로그인이 필요합니다.");
        }
        
        int totalTokens = cbtTokenUsageService.getTotalTokensByMember(loginMember.getMemberNo());
        int totalBeans = cbtTokenUsageService.getTotalBeansByMember(loginMember.getMemberNo());
        int remainingBeans = cbtTokenUsageService.getRemainingBeans(
            loginMember.getMemberNo(), 
            loginMember.getBeansAmount() != null ? loginMember.getBeansAmount() : 0
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalTokens", totalTokens);
        result.put("totalBeans", totalBeans);
        result.put("remainingBeans", remainingBeans);
        
        return result;
	}	
	
    
    /**
     * 챗봇 타입별 시스템 프롬프트 생성
     * @param cbSessionType BASIC 또는 KONG
     * @return 시스템 프롬프트
     */
    private String createSystemPrompt(String cbSessionType) {
        if("BASIC".equals(cbSessionType)) {
            //return "당신은 DevLog 자유게시판의 AI 어시스턴트입니다. " +
            //       "사용자의 질문에 친절하고 정확하게 답변해주세요. " +
            //       "**중요: 모든 답변은 반드시 500자 이내로 간결하게 작성해주세요.** " +
            //       "핵심 내용만 포함하고 불필요한 설명은 생략하세요.";
            return "당신은 DevLog 자유게시판의 AI 어시스턴트입니다. " +
            "사용자의 질문에 친절하고 정확하게 답변해주세요. " +
            "**중요: 모든 답변은 반드시 20자 이내로 간결하게 작성해주세요.** " +
            "핵심 내용만 포함하고 불필요한 설명은 생략하세요."; // 테스트용
        } else {
            // KONG 타입: 제한 없음
            return "당신은 DevLog 자유게시판의 프리미엄 AI 어시스턴트입니다. " +
                   "사용자의 질문에 친절하고 상세하게 답변해주세요. " +
                   "필요한 경우 자세한 설명과 예시를 포함하여 답변할 수 있습니다.";
        }
    }    
    
    
	  //  ///////// 이건 일단 안씀
	  public Map<String,Object> sendLastAnswer(String sessionId, String question, String answer){
	
	      ChatResponse response = chatModel.call(
	              new Prompt(List.of(
	                      new UserMessage("이전 질문: "+question),
	                      new AssistantMessage("이전 답변: "+answer),
	                      new UserMessage("이전 답변을 참고해서 다시 설명해줘.")
	              ))
	      );
	
	      String reply = response.getResult().getOutput().getText(); // Spring AI 0.1.x 이후
	
	      return Map.of(
	              "reply", reply,
	              "usage", Map.of(
	                      "prompt_tokens", 7, // dummy data for usage.getPromptTokens(),
	                      "completion_tokens", 7, // dummy data for usage.getCompletionTokens(),
	                      "total_tokens", 7, // dummy data for serverTokens,
	                      "accumulated_tokens", 777 //dummy data for tokenMap.get(sessionId)
	                      , "accumulated_tokens", 77777 // dummy data 
	                      , "accumulated_usedBeans", 7777777 // dummy data 
	              )                
	      );
	  }
	
}


