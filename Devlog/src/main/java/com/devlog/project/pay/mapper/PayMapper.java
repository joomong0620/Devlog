package com.devlog.project.pay.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.devlog.project.pay.dto.PayDTO;

@Mapper
public interface PayMapper {

	
	// 내 커피콩 조회
	public PayDTO selectMyBeans(Long memberNo);

	// 내 커피콩 내역 조회
	public List<PayDTO> selectBeansHistory(Long memberNo);

	// 결제 완료
	public int insertPayment(PayDTO payment);

	// 결제 내역
	public int insertHistory(PayDTO payment);

	// 내 커피콩 내역 업데이트
	public int updateMemberBeans(PayDTO payment);

	public PayDTO selectPaymentByNo(int beansPayNo);

	public int updatePayStatusCancel(int beansPayNo);

}
