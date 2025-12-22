package com.devlog.project.member.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;

import com.devlog.project.member.model.dto.MemberLoginResponseDTO;
import com.devlog.project.member.model.dto.MemberSignUpRequestDTO;
import com.devlog.project.member.model.security.CustomUserDetails;
import com.devlog.project.member.model.service.MemberService2;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/member")  // GET and POST 다 처리
@SessionAttributes("loginMember") // Model에 담은것을 model객체로 Session Scope 에 올리겠다
@RequiredArgsConstructor 
public class MemberController {

	private final MemberService2 service; //
	
	private final AuthenticationManager authenticationManager; // spring-security
	
	// -------------------------- [ 로그인 ] 
	// 로그인 페이지(전용 화면) 이동
	@GetMapping("/login")
	public String login(HttpServletRequest request, Model model) {  
		
		// 쿠키 설정
	    Cookie[] cookies = request.getCookies();
	    if (cookies != null) {
	        for (Cookie c : cookies) {
	            if ("saveId".equals(c.getName())) {
	                model.addAttribute("cookie", Map.of("saveId", Map.of("value", c.getValue())));
	            }
	        }
	    }
	    	    
	    return "member/login";
	}
	
	
	// 로그인 요청처리
    @PostMapping("/login")
    public ResponseEntity<MemberLoginResponseDTO> login(
            @RequestParam("memberEmail") String memberEmail,  // @RequestBody 제거하고, 이거로 Form 데이터 받기(application/x-www-form-urlencoded)
            @RequestParam("memberPw") String memberPw        
    ) {

        // 인증 토큰 생성 
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(memberEmail, memberPw);   	
    	

        // 인증 시도 (여기서 Security가 모든 검증 수행) -> 실패시 인증실패 exception발생
        Authentication authentication =
                authenticationManager.authenticate(authToken);

        // 인증 성공 → SecurityContext에 저장 
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 인증된 사용자 정보 꺼내기 (spring-security가 Member 엔티티에서 꺼내오는 회원정보)
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();
        System.out.println("===== 인증 성공 =====");
        //log.info("##### userDetails: {}", userDetails); // 
        System.out.println("userDetails 타입: " + userDetails.getClass().getName());
        System.out.println("##### userDetails: ");
        System.out.println(userDetails);
        // 상세하게 출력
        System.out.println("memberNo: " + userDetails.getMember().getMemberNo());
        System.out.println("memberEmail: " + userDetails.getMember().getMemberEmail());
        System.out.println("memberNickname: " + userDetails.getMember().getMemberNickname());
        System.out.println("authorities: " + userDetails.getAuthorities());
        System.out.println("====================");        
         
        // 응답 DTO 생성
        MemberLoginResponseDTO response =
                new MemberLoginResponseDTO(
                        userDetails.getMember().getMemberNo(),
                        userDetails.getMember().getMemberEmail(),
                        userDetails.getMember().getMemberNickname(), 
                        authentication.getAuthorities()
                                .iterator()
                                .next()
                                .getAuthority()
                );
        //log.info("##### response(MemberLoginResponseDTO): {}", response); // 
        System.out.println("##### 응답 DTO (MemberLoginResponseDTO): ");
        System.out.println(response);  
        
        return ResponseEntity.ok(response);
    }
	
	
	@ResponseBody // Postman API test용 
    @GetMapping("/loginTest")
    public String loginTest(Authentication authentication) {
        
        if (authentication == null) {
            System.out.println("###%%%@@@ authentication is null");
        } else {
            System.out.println("###%%%@@@ login user = " + authentication.getName());
        }
              
        return "ok";
    }	
	
	
	// -------------------------- [ 로그아웃 ] 
	// 로그아웃 요청처리
	// GET - 리다이렉트 방식
	@GetMapping("/logout")
	public String logoutGet(HttpServletRequest request) {
	    logout(request);
	    System.out.println("###%%%@@@ 로그아웃 성공 (GET)");
	    return "redirect:/member/login";
	}

	// POST - REST API 방식
	@PostMapping("/logout")
	public ResponseEntity<Map<String, String>> logoutPost(HttpServletRequest request) {
	    logout(request);
	    System.out.println("###%%%@@@ 로그아웃 성공 (POST)");
	    
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "로그아웃 성공");
	    return ResponseEntity.ok(response);
	}

	// 공통 로그아웃 로직
	private void logout(HttpServletRequest request) {
	    HttpSession session = request.getSession(false);
	    if (session != null) {
	        session.invalidate();
	    }
	    SecurityContextHolder.clearContext();
	}
	
	
	
	
	// -------------------------- [ 회원 가입 ] 
	// 회원가입 페이지(전용화면) 이동: GET방식
	@GetMapping("/signUp")
	public String signUp() {
		
		return "member/signUp";
	}	
	
	
	// 회원 가입 진행 // 아이디(이메일), 비밀번호, 이름, 닉네임, 전화번호, 경력사항, 이메일 수신동의, 관리자 계정 신청 
	@PostMapping(value="/signUp", consumes="application/json")  // Postman test용
    public ResponseEntity<Void> signUp( 
            @RequestBody MemberSignUpRequestDTO request
    ) {
		log.info("email = {}", request.getMemberEmail());
		log.info("###@@@%%% CONTROLLER DTO = {}", request);
		
		System.out.println("CONTROLLER DTO = " + request);

        service.signUp(request);
        return ResponseEntity.ok().build();
    }	
	
	
	@PostMapping("/signUpTest") // Postman test용: {} 나오면 Postman 문제, 값나오면 DTO문제
	public ResponseEntity<?> test(@RequestBody Map<String, Object> body) {
	    System.out.println("BODY = " + body);
	    return ResponseEntity.ok().build();
	}
	
	@PostMapping("/signUp-debug")// Postman test용
	public ResponseEntity<?> debug(HttpServletRequest request) throws Exception {

	    String body = request.getReader()
	            .lines()
	            .collect(Collectors.joining("\n"));

	    System.out.println("RAW BODY >>> " + body);

	    return ResponseEntity.ok().build();
	}
	
	
}
