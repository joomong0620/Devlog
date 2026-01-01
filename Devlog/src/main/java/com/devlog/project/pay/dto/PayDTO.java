package com.devlog.project.pay.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class PayDTO {
	
	// 커피콩 결제
	@JsonProperty("beansPayNo")
	private int beansPayNo;
	
	private Long memberNo;
	
	@JsonProperty("paymentId")
	private String paymentId;
	
	@JsonProperty("payMethod")
	private String payMethod;
	private int price;
	private String payDate;
	private Integer usedAmount;
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
