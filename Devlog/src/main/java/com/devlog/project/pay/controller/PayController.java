package com.devlog.project.pay.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.devlog.project.member.model.dto.MemberLoginResponseDTO;
import com.devlog.project.pay.dto.PayDTO;
import com.devlog.project.pay.service.PayService;

@Controller
@PropertySource("classpath:config.properties")
public class PayController {

	@Autowired PayService payService;
	
	@Value("${storeId}")
	private String storeId;
	
	@Value("${channelKey}")
	private String channelKey;
	
	
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
		
		model.addAttribute("channelKey", channelKey);
		model.addAttribute("storeId", storeId);

		return "/coffeebeans/mybeans";
	}
	
	// 결제 
	@PostMapping("/payment/complete")
	@ResponseBody
	public ResponseEntity<?> completePayment(@RequestBody PayDTO payment){
		System.out.println("결제 데이터" + payment);
		
		int result = payService.insertPayment(payment);
		
		return ResponseEntity.ok().body(
				java.util.Map.of("result", result));
	}
	
	
	
	
	
	
	
	

}
