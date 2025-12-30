package com.devlog.project.myPage.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/myPage")
public class MyPageController {
	
	// "내 활동" 페이지 이동
	@GetMapping("/activity")
	public String myActivity() {
        return "myPage/myActivity";
	}
	
	@GetMapping("/settings")
	public String mySettings() {
		return "myPage/mySetting";
	}
}
