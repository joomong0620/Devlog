package com.devlog.project.myPage.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devlog.project.member.enums.CommonEnums;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;
import com.devlog.project.myPage.dto.MemberUpdateDto;
import com.devlog.project.myPage.dto.MyActivityDto;
import com.devlog.project.myPage.mapper.MyPageMapper; // [필수] 우리가 만든 Mapper import

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

    private final MemberRepository memberRepository; // 조회 및 중복검사용 (JPA)
    private final MyPageMapper myPageMapper;         // [수정] 수정용 (MyBatis)
    private final PasswordEncoder passwordEncoder;

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
    
    
    // 구독 금액 설정
	@Override
	@Transactional
	public void setSubscribePrice(Map<String, Object> paramMap) {
		
		Long memberNo = ((Number)paramMap.get("memberNo")).longValue();
		Integer price = Integer.parseInt(paramMap.get("price").toString());

		
		Member member = memberRepository.findById(memberNo)
				.orElseThrow(() -> new IllegalArgumentException("회원 정보가 없습니다.")); 
		
		
		member.setSubscriptionPrice(price);
		
		
		
	}
	
	// 내 활동 리스트 조회
	@Override
    @Transactional(readOnly = true) // 조회 전용이라 readOnly 권장
    public List<MyActivityDto> getMyActivityList(Long memberNo, String type) {
        
        // type: likes, history, drafts, purchases
        switch (type) {
            case "likes":
                return myPageMapper.selectLikedPosts(memberNo);
            case "history":
                // VIEW_LOG 테이블이 없으면 에러 날 수 있으니 주의 (생성했으니 안심!)
                return myPageMapper.selectViewHistory(memberNo);
            case "drafts":
                return myPageMapper.selectDrafts(memberNo);
            case "purchases":
                return myPageMapper.selectPurchasedPosts(memberNo);
            default:
                // 이상한 type이 오면 빈 리스트 반환
                return List.of(); 
        }
    }
	
	
	// private final PasswordEncoder passwordEncoder;
	// 비밀번호 변경
	@Override
	@Transactional
	public Integer changePw(Map<String, Object> paramMap) {

		Integer result = null;
		
		Long memberNo = ((Number)paramMap.get("memberNo")).longValue();
		
		Member member = memberRepository.findById(memberNo).orElseThrow();
		
		String currentPw = paramMap.get("currentPw").toString();
		
		System.out.println("입력 PW: [" + currentPw + "]");
		System.out.println("DB PW: [" + member.getMemberPw() + "]");
		System.out.println("matches 결과: " + passwordEncoder.matches(currentPw, member.getMemberPw()));
		System.out.println("Encoder 타입: " + passwordEncoder.getClass().getName());
		
		if(!passwordEncoder.matches(currentPw, member.getMemberPw())){ // 비밀번호 일치
			
			return 0;
		} else {
			
			String newPw = paramMap.get("newPw").toString();
			
			if (passwordEncoder.matches(newPw, member.getMemberPw())) { // 현재 비밀번호와 변경할 비밀번호 일치
				return 1;
			} else { // 비밀번호 변경
				
				String encodedPw = passwordEncoder.encode(newPw); 
				
				member.setMemberPw(encodedPw);
				
				return 2;
			}
			
			
			
		}
		
		
	}
	
	// 회원 탈퇴 처리
	@Override
	@Transactional
	public int withdraw(Long memberNo, String checkPw) {
		
		try {
			Member member = memberRepository.findById(memberNo).orElseThrow();
			
			// 비밀번호 불일치 체크
	        if (!passwordEncoder.matches(checkPw, member.getMemberPw())) {
	            return 0; // 비번 틀림
	        }
	        
	        member.setMemberDelFl(CommonEnums.Status.Y);
	        
	        return 1;
			
			
		} catch (Exception e) {
			e.printStackTrace();
			return -1; // 에러
		}
		
	}
}