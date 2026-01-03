package com.devlog.project.manager.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.devlog.project.pay.dto.PayDTO;
import com.devlog.project.pay.service.PayService;


@Controller
@RequestMapping("/admin")
public class ManagerController {
	
	@Autowired PayService payService;
	
	
	
    // 관리자 홈
    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "manager/manager-home";
    }
    
    
 // 결제 관리 페이지 이동
    @GetMapping("/dashboard/pay")
    public String adminPay(Model model) {
        
        // DB에서 전체 결제 내역 조회 (충전, 환전, 사용 등 통합 내역)
         List<PayDTO> payList = payService.selectAllBeansHistory();
         model.addAttribute("payList", payList);
        
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
