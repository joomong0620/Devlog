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

}
