package com.devlog.project.member.controller;


import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;

import com.devlog.project.member.service.MemberService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/member")  
@SessionAttributes("loginMember") 
@RequiredArgsConstructor 
public class MemberController {

	 private final MemberService memberService;
	
	// 로그인 페이지(전용 화면) 이동
	@GetMapping("/login")
	public String login(HttpServletRequest request, Model model) {  
		
		//String saveId = ""; 
		
		// 쿠키 설정
	    Cookie[] cookies = request.getCookies();
	    if (cookies != null) {
	        for (Cookie c : cookies) {
	            if ("saveId".equals(c.getName())) {
	                model.addAttribute("cookie", Map.of("saveId", Map.of("value", c.getValue())));
	            	//saveId = c.getValue();
	            }
	        }
	    }
	    
	    //model.addAttribute("cookie", Map.of("saveId", Map.of("value", saveId)));
	    
	    return "member/login";
	}
	
	
	/**  로그인 요청 처리
	 * @return 메인페이지 redirect 주소 
	 */	
	
	
	
	
	// 로그아웃
	@GetMapping("logout")
	public String logout(SessionStatus status) {
		status.setComplete();
		
		return "redirect:/";
		
	}
	

	
	
	// 회원가입 페이지(전용화면) 이동: GET방식
	@GetMapping("/signUp")
	public String signUp() {
		
		return "member/signUp";
	}	
	
	
	// 회원 가입 진행 // 아이디(이메일), 비밀번호, 이름, 닉네임, 전화번호, 경력사항, 이메일 수신동의, 관리자 계정 신청 
	
	
	
}
