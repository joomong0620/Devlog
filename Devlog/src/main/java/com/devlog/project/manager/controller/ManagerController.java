package com.devlog.project.manager.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.devlog.project.member.model.dto.MemberLoginResponseDTO;
import com.devlog.project.pay.dto.PayDTO;
import com.devlog.project.pay.service.PayService;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;


@Controller
@RequestMapping("/manager")
public class ManagerController {
	
	@Autowired PayService payService;
	
	
	
    // 관리자 홈
    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "manager/manager-home";
    }
    
    
    // 결제 관리
    @GetMapping("/dashboard/pay")
    public String adminPay(Model model,
    		@RequestParam(value="query", required=false) String query,
    		@RequestParam(value="type", required=false) String type,
    		@RequestParam(value="cp", required=false, defaultValue ="1") int cp,
    		@SessionAttribute(value = "loginMember", required = false) MemberLoginResponseDTO loginMember) {
        
    	Map<String, Object> paramMap = new HashMap<>();
    	paramMap.put("query", query);
    	System.out.println(query);
    	paramMap.put("type", type); 
    	
    	
    	PageHelper.startPage(cp, 10);
    	PageInfo<PayDTO> pageInfo = payService.selectAllBeansHistory(paramMap, cp);
    	model.addAttribute("payList", pageInfo.getList()); // 실제 목록
        model.addAttribute("pagination", pageInfo);      // 페이지 정보 전체
        
        return "manager/manager-pay";
    }
    
    
    // 환전 ok
    @PostMapping("/pay/approve")
    @ResponseBody
    public int approveExchange(@RequestBody PayDTO data) {
        System.out.println("전달받은 번호 : " + data.getExchangeNo()); 
        return payService.okExchange(data.getExchangeNo());
    }
    
  
    
}
