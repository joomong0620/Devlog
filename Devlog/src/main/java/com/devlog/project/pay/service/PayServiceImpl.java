package com.devlog.project.pay.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devlog.project.pay.dto.PayDTO;
import com.devlog.project.pay.mapper.PayMapper;

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
	
}
