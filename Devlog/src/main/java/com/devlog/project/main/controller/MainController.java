package com.devlog.project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class MainController {

	@GetMapping("/")
	public String mainPage(Model model) { 
		return "common/main"; 
	}
	
	@GetMapping("/loginError")
	public String loginError(RedirectAttributes ra) {
		ra.addFlashAttribute("message", "로그인 후 이용해 주세요.");
		
		return "redirect:/";
	}	
	
}
