package com.devlog.project.pay.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.devlog.project.member.model.dto.MemberLoginResponseDTO;
import com.devlog.project.pay.dto.PayDTO;
import com.devlog.project.pay.service.PayService;

@Controller
public class PayController {

	@Autowired PayService payService;
	
	// 화면 전환
	@GetMapping("/coffeebeans") 
	public String coffeebeans(Model model,
			@SessionAttribute(value = "loginMember", required = false) MemberLoginResponseDTO loginMember) {
		if (loginMember == null) return "redirect:/member/login"; 
		Long memberNo = loginMember.getMemberNo();
		
		// 현재 내 커피콩 잔액
		PayDTO myBeans = payService.selectMyBeans(memberNo);
		
		// 내 결제 내역 
		List<PayDTO> historyList = payService.selectBeansHistory(memberNo);
		
		model.addAttribute("myBeans", myBeans);
		model.addAttribute("historyList", historyList);

		return "/coffeebeans/mybeans";
	}
	

}
