package com.devlog.project.member.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.devlog.project.member.model.dto.MemberLoginRequestDTO;
import com.devlog.project.member.model.dto.MemberLoginResponseDTO;
import com.devlog.project.member.model.dto.MemberSignUpRequestDTO;
import com.devlog.project.member.model.security.CustomUserDetails;
import com.devlog.project.member.model.service.MemberService;
import com.devlog.project.member.model.service.MemberService2;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller // @Controller: 리턴값을 "뷰이름"으로 해석, @RestController: 리턴값을 HTTP Body(JSON)로 해석 
			// => ResponseEntity는 자동으로 Body(JSON)이 아님 => @RestController 또는 @Controller + @ResponseBody 이어야함
@RequestMapping("/member")  // GET and POST 다 처리
@SessionAttributes("loginMember") // Model에 담은것을 model객체로 Session Scope 에 올리겠다 => BUT, @SessionAttributes는 View를 반환할 때만 동작함 ==>@SessionAttributes + @ResponseBody: 동작 안 함
@RequiredArgsConstructor 
public class MemberController {

	private final MemberService memberService; //
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
    @ResponseBody
    public ResponseEntity<?> login(
            @RequestParam("memberEmail") String memberEmail,  // @RequestBody 제거하고, 이거로 Form 데이터 받기(application/x-www-form-urlencoded)
            @RequestParam("memberPw") String memberPw,
            /////
    		Model model,
            @RequestParam(value="saveId", required=false) String saveId,
			HttpServletResponse resp,          
			HttpServletRequest request
    ) {
    	
    	try {
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
	        System.out.println(saveId);
	        System.out.println("===== 인증 성공 =====");
	        //log.info("##### userDetails: {}", userDetails); // 
	        System.out.println("userDetails 타입: " + userDetails.getClass().getName());
	        System.out.println("##### userDetails: ");
	        System.out.println(userDetails);
	        // 상세하게 출력
	        System.out.println("memberNo: " + userDetails.getMember().getMemberNo());
	        System.out.println("memberEmail: " + userDetails.getMember().getMemberEmail());
	        System.out.println("memberNickname: " + userDetails.getMember().getMemberNickname());
	        System.out.println("authorities: " + userDetails.getAuthorities()); // ?
	        System.out.println("profileImg;: " + userDetails.getMember().getProfileImg());
	        System.out.println("====================");        
	         
	        // ------------------------------------------------
	        // 응답 DTO 생성: 서비스에서 처리
	        MemberLoginResponseDTO response =
	                memberService.toLoginResponse( // toLoginResponse
	                    userDetails.getMember(),
	                    authentication.getAuthorities()
	                );        
	        
	        
	        //log.info("##### response(MemberLoginResponseDTO): {}", response); // 
	        System.out.println("##### 응답 DTO (MemberLoginResponseDTO): ");
	        System.out.println(response);  
	        
	        // --------------------------------------------------
			// 로그인 성공 시 response DTO에 로그인회원정보 담겨있다
			// 1) 세션에 로그인한 회원 정보 추가
	        // 세션 고정 공격 방지 + 이전 사용자 정보 제거
	        HttpSession oldSession = request.getSession(false);
	        if (oldSession != null) {
	            oldSession.invalidate();
	        }

	        HttpSession newSession = request.getSession(true);
	        newSession.setAttribute("loginMember", response);
				
			// 2) 아이디 저장(쿠키에)
			// 쿠키 생성(K:V로 해당 쿠키에 담을 (로그인멤버의 이메일) 데이터 지정)
			Cookie cookie = new Cookie("saveId", response.getMemberEmail()); // 로그인 성공시
			if(saveId != null) { // 체크 되었을 때
				cookie.setMaxAge(60*60*24*30); // 초 단위; => 한달동안 유지되는 쿠키 생성
			} else { // 체크 않되었을 때
				cookie.setMaxAge(0); // 기존 쿠키 삭제 -> 0초 동안 유지되는 쿠키 생성
			}
			
			// 클라이언트가 어떤 요청을 할 때 쿠키가 첨부될지 경로(주소)를 지정
			cookie.setPath("/"); // localhost/ 이하의 모든 주소 ex) /, /member/login, /member/logout 등 모든 요청에 쿠키 첨부
			
			System.out.println("saveId and cookie");
	        System.out.println(saveId);
	        System.out.println(cookie);
			// 응답 객체(HttpServletResponse)을 이용해서 만들어진 쿠키를 클라이언트에게 전달
			resp.addCookie(cookie); // @ResponseBody, ResponseEntity, Spring Security 여부와 전혀 상관없이 동작(HTTP 레벨에서의 동작=>쿠키는 Body가 아니라 Header(HTTP Response Header; HTTP 표준 헤더)로 전달)
			
	        return ResponseEntity.ok(response);
    	} catch (BadCredentialsException ex) {
            // 로그인 실패 → 401 Unauthorized + 메시지 전달
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        } catch (Exception ex) {
            // 기타 서버 오류
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    	
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
	public String logoutGet(HttpServletRequest request, SessionStatus status) {
		status.setComplete(); // @SessionAttributes 제거
	    logout(request);
	    System.out.println("###%%%@@@ 로그아웃 성공 (GET)");
	    return "redirect:/member/login";
	}

	// POST - REST API 방식
	@ResponseBody
	@PostMapping("/logout")
	public ResponseEntity<Map<String, String>> logoutPost(
			HttpServletRequest request
			, SessionStatus status
			) {
		status.setComplete(); // @SessionAttributes 제거
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
	@ResponseBody
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
	
	@ResponseBody
	@PostMapping("/signUpTest") // Postman test용: {} 나오면 Postman 문제, 값나오면 DTO문제
	public ResponseEntity<?> test(@RequestBody Map<String, Object> body) {
	    System.out.println("BODY = " + body);
	    return ResponseEntity.ok().build();
	}
	
	@ResponseBody
	@PostMapping("/signUp-debug")// Postman test용
	public ResponseEntity<?> debug(HttpServletRequest request) throws Exception {

	    String body = request.getReader()
	            .lines()
	            .collect(Collectors.joining("\n"));

	    System.out.println("RAW BODY >>> " + body);

	    return ResponseEntity.ok().build();
	}
	
	
}
