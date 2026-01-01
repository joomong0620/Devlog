package com.devlog.project.pay.service;


import java.util.List;

import com.devlog.project.pay.dto.PayDTO;

public interface PayService {

	// 내 커피콩 조회
	PayDTO selectMyBeans(Long memberNo);

	// 내 커피콩 내역 조회
	List<PayDTO> selectBeansHistory(Long memberNo);

	
	// 결제 요청
	int insertPayment(PayDTO payment);

	
	// 결제 취소
	boolean cancelPayment(PayDTO payDTO, String secretKey);



}
