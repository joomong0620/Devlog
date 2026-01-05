package com.devlog.project.myPage.service;

import java.util.List;
import java.util.Map;
import com.devlog.project.myPage.dto.MemberUpdateDto;
import com.devlog.project.myPage.dto.MyActivityDto;

public interface MyPageService {
    
    // 내 정보 수정
    Map<String, Object> updateMemberInfo(String email, MemberUpdateDto dto);
    
    // 프로필 이미지 수정
    void updateProfileImage(String email, String imageUrl);
    
    
    // 구독료 설정
	void setSubscribePrice(Map<String, Object> paramMap);
	
	// 내 활동 리스트 조회
    List<MyActivityDto> getMyActivityList(Long memberNo, String type);
}