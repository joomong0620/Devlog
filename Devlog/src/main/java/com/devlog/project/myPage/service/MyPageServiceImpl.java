package com.devlog.project.myPage.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devlog.project.member.enums.CommonEnums;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;
import com.devlog.project.myPage.dto.MemberUpdateDto;
import com.devlog.project.myPage.mapper.MyPageMapper; // [필수] 우리가 만든 Mapper import

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

    private final MemberRepository memberRepository; // 조회 및 중복검사용 (JPA)
    private final MyPageMapper myPageMapper;         // [수정] 수정용 (MyBatis)

    @Override
    @Transactional
    public Map<String, Object> updateMemberInfo(String email, MemberUpdateDto dto) {
        Map<String, Object> result = new HashMap<>();

        // 1. 현재 정보 확인 (닉네임 비교용)
        Member member = memberRepository.findByMemberEmailAndMemberDelFl(email, CommonEnums.Status.N)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보 없음"));

        // 2. 닉네임 중복 검사
        if (!member.getMemberNickname().equals(dto.getMemberNickname())) {
            if (memberRepository.existsByMemberNickname(dto.getMemberNickname())) {
                result.put("success", false);
                result.put("message", "이미 사용 중인 닉네임입니다.");
                return result;
            }
        }

        // 3. [변경] MyPageMapper를 통해 UPDATE 실행
        int updateCount = myPageMapper.updateMemberInfo(email, dto);

        if (updateCount > 0) {
            result.put("success", true);
            result.put("message", "정보가 수정되었습니다.");
        } else {
            result.put("success", false);
            result.put("message", "정보 수정 실패 (DB 오류)");
        }
        
        return result;
    }

    @Override
    @Transactional
    public void updateProfileImage(String email, String imageUrl) {
        // [변경] MyPageMapper 사용
        myPageMapper.updateProfileImage(email, imageUrl);
    }
    
    
    // 구독 설정
	@Override
	@Transactional
	public void setSubscribePrice(Map<String, Object> paramMap) {
		
		Long memberNo = ((Number)paramMap.get("memberNo")).longValue();
		
		
		Integer price = Integer.parseInt(paramMap.get("price").toString());

		
		Member member = memberRepository.findById(memberNo).orElseThrow(); 
		
		
		member.setSubscriptionPrice(price);
		
		
		
		
		
		
	}
}