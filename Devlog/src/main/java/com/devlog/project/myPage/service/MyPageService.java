package com.devlog.project.myPage.service;

import java.util.Map;
import com.devlog.project.myPage.dto.MemberUpdateDto;

public interface MyPageService {
    
    // 내 정보 수정
    Map<String, Object> updateMemberInfo(String email, MemberUpdateDto dto);
    
    // 프로필 이미지 수정
    void updateProfileImage(String email, String imageUrl);
    
    
    // 구독료 설정
	void setSubscribePrice(Map<String, Object> paramMap);
	
	// 비밀번호 변경
	Integer changePw(Map<String, Object> paramMap);
	
	
	// 탈퇴
	int withdraw(Long memberNo, String string);
}