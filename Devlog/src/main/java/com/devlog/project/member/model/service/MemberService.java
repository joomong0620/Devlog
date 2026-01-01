package com.devlog.project.member.model.service;


import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devlog.project.member.model.dto.LevelDTO;
import com.devlog.project.member.model.dto.MemberLoginResponseDTO;
import com.devlog.project.member.model.dto.MemberProfileDTO;
import com.devlog.project.member.model.entity.Level;
import com.devlog.project.member.model.entity.Member;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {  // 로그인(login) 서비스 전용

    @Transactional(readOnly = true)
    public MemberLoginResponseDTO toLoginResponse(Member member,
                                                  Collection<? extends GrantedAuthority> authorities) {

        Level level = member.getMemberLevel(); // LAZY 초기화 (트랜잭션 안)

        LevelDTO levelDTO = new LevelDTO(
            level.getLevelNo(),
            level.getTitle(),
            level.getRequiredTotalExp()
        );

        String role = authorities.iterator().next().getAuthority();

        return new MemberLoginResponseDTO(
            member.getMemberNo(),
            member.getMemberEmail(),
            member.getMemberNickname(),
            role,
            member.getMemberAdmin(),
            member.getMemberSubscribe(),
            member.getMemberDelFl(),
            member.getMemberCareer(),
            member.getProfileImg(),
            member.getMyInfoIntro(),
            member.getMyInfoGit(),
            member.getMyInfoHomepage(),
            member.getSubscriptionPrice(),
            member.getBeansAmount(),
            member.getCurrentExp(),
            member.getMCreateDate(),
            levelDTO
        );
    }


    
    
    

}

