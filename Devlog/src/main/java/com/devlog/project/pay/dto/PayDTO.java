package com.devlog.project.pay.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class PayDTO {
	
	// 커피콩 결제
	private int beansPayNo;
	private Long memberNo;
	private String paymentId;
	private String payMethod;
	private int price;
	private String payDate;
	private int usedAmount;
	private String payStatus;
	
	private int beansAmount;
	
	// 커피콩 내역
	private int beansHistory;
	private int payAmount;
	private int displayPrice;
	
	
	// 커피콩 거래
	private int tradeNo;
	private int buyerNo; //구매자
	private int sellerNo; //구매당한사람
	private String contentType; //컨텐츠, 구독, 챗봇
	private String tradeAt; // 거래 일시
	private int contentId; // 대상 ID(게시글번호, 회원번호, 챗봇번호)
	
	
	
	
	
}
