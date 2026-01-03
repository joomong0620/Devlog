package com.devlog.project.pay.service;

import org.springframework.http.MediaType;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.devlog.project.pay.dto.PayDTO;
import com.devlog.project.pay.mapper.PayMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;

@Service
public class PayServiceImpl implements PayService {

	
	@Autowired
	private PayMapper paymapper;
	


	@Override
	public PayDTO selectMyBeans(Long memberNo) {
		return paymapper.selectMyBeans(memberNo);
	}



	@Override
	public List<PayDTO> selectBeansHistory(Long memberNo) {
		return paymapper.selectBeansHistory(memberNo);
	}


	@Transactional(rollbackFor = Exception.class)
	@Override
	public int insertPayment(PayDTO payment) {
		// 결제 정보 저장
		int result = paymapper.insertPayment(payment);
		
		if(result > 0) {
			paymapper.insertHistory(payment);
			paymapper.updateMemberBeans(payment);
		}
		return result;
	}



	@Transactional(rollbackFor = Exception.class)
	@Override
	public boolean cancelPayment(PayDTO payDTO, String secretKey) {

	    // 결제 정보 조회
	    PayDTO payment = paymapper.selectPaymentByNo(payDTO.getBeansPayNo());
	    if (payment == null) {
	        throw new RuntimeException("결제 정보가 존재하지 않습니다.");
	    }

	    // 이미 사용된 결제인지 확인
	    if (payment.getUsedAmount() != null && payment.getUsedAmount() > 0) {
	        throw new RuntimeException("이미 사용된 결제는 취소할 수 없습니다.");
	    }

	    // PortOne 결제 취소 요청
	    RestTemplate restTemplate = new RestTemplate();

	    HttpHeaders headers = new HttpHeaders();
	    headers.add("Authorization", "PortOne " + secretKey);
	    headers.setContentType(MediaType.APPLICATION_JSON);


	    Map<String, Object> body = new HashMap<>();
	    body.put("reason", "고객 요청에 의한 결제 취소");

	    HttpEntity<Map<String, Object>> entity =
	            new HttpEntity<>(body, headers);

	    String url = "https://api.portone.io/payments/"
	            + payment.getPaymentId() + "/cancel";

	    try {
	    	ResponseEntity<Map> response =
	    	        restTemplate.postForEntity(url, entity, Map.class);

	        // 성공 시 DB 상태만 변경
	        if (response.getStatusCode().is2xxSuccessful()) {
	            paymapper.updatePayStatusCancel(payment.getBeansPayNo());
	         
	            // DTO의 금액을 음수로 전환 (잔액 차감 및 히스토리 기록용)
	            payment.setPrice(-payment.getPrice()); 

	            // 회원 테이블의 보유 콩 잔액 차감
	            int updateResult = paymapper.updateMemberBeans(payment);

	            // 히스토리 테이블에 '취소' 내역 추가
	            int historyResult = paymapper.insertHistory(payment);

	            return updateResult > 0 && historyResult > 0;
	        }

	    } catch (Exception e) {
	        throw new RuntimeException("포트원 결제 취소 실패", e);
	    }

	    return false;
	}


	@Transactional(rollbackFor = Exception.class)
	@Override
	public int insertExchange(PayDTO pay) {

	    // 현재 보유 콩 확인 
	    PayDTO myBeans = paymapper.selectMyBeans(pay.getMemberNo());
	    int currentBeans = myBeans.getBeansAmount(); 
	    System.out.println(currentBeans);
	    
	    // 사용자가 입력한 원본 금액
	    int originAmount = pay.getRequestAmount();

	    // 검증 (최소 금액 및 잔액 확인)
	    if (originAmount < 5000) return -3;
	    if (currentBeans < originAmount) return -2;
	    if (pay.getReturnBank() == null || pay.getReturnBank().isEmpty()) return -4;

	    // 수수료 10% 제외한 금액 세팅 및 내역 삽입
	    pay.setRequestAmount((int)(originAmount * 0.9));
	    int result = paymapper.insertExchange(pay);

	    // 성공 시 원본 금액만큼 회원 잔액 차감
	    if (result > 0) {
	        // 기존 필드인 price에 차감할 액수를 음수로 세팅
	        pay.setPrice(-originAmount); 
	        result = paymapper.updateMemberBeans(pay);
	        if(result > 0) {
	            paymapper.insertHistory(pay); 
	        }
	        
	    }

	    return result;
	}



	@Override
	public List<Map<String, Object>> selectBankList() {
		return paymapper.selectBankList();
	}

	
	
	// 환전 ok
	@Override
	public int okExchange(int exchangeNo) {
		return paymapper.okExchange(exchangeNo);
	}


	// 관리자용 
	public PageInfo<PayDTO> selectAllBeansHistory(Map<String, Object> paramMap, int cp) {
	    
	    // PageHelper.startPage(현재페이지, 한페이지당개수);
	    PageHelper.startPage(cp, 10); 
	    
	    // 전체 조회 쿼리 호출 
	    List<PayDTO> payList = paymapper.selectAllBeansHistory(paramMap);
	    
	    return new PageInfo<>(payList, 5); // 5는 하단에 보여줄 페이지 번호 개수
	}
	
	
	
}
