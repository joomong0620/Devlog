package com.devlog.project.member.model.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devlog.project.member.enums.CommonEnums.Status;
import com.devlog.project.member.model.dto.MemberSignUpRequestDTO;
import com.devlog.project.member.model.entity.Level;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.LevelRepository;
import com.devlog.project.member.model.repository.MemberRepository;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional // 회원가입은 하나의 트랜잭션
public class MemberService2 {

    private final MemberRepository memberRepository;
    private final LevelRepository levelRepository;
    private final PasswordEncoder passwordEncoder;

    public void signUp(MemberSignUpRequestDTO dto) {

    	log.info("email = {}", dto.getMemberEmail());
    	log.info("pw = {}", dto.getMemberPw());
    	System.out.println(dto);

        // 이메일 중복 체크 
        if (memberRepository.existsByMemberEmail(dto.getMemberEmail())) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }

        // 기본 레벨 조회 (LV1) 
        Level defaultLevel = levelRepository.findById(1)
                .orElseThrow(() -> new IllegalStateException("기본 레벨이 존재하지 않습니다."));

        // Member Entity 생성 
        Member member = Member.builder()
                .memberEmail(dto.getMemberEmail())
                .memberPw(passwordEncoder.encode(dto.getMemberPw())) // passwordEncoder	반드시 Service에서
                .memberName(dto.getMemberName())
                .memberNickname(dto.getMemberNickname())
                .memberTel(dto.getMemberTel())
                .memberCareer(dto.getMemberCareer())
                .memberAdmin(dto.getMemberAdmin() != null ? dto.getMemberAdmin() : Status.N) //	null 방어 처리
                .memberSubscribe(dto.getMemberSubscribe() != null ? dto.getMemberSubscribe() : Status.N) //	null 방어 처리
                .memberLevel(defaultLevel) // 기본 Level	클라이언트가 못 건드리게
                .build();

        //  저장 
        memberRepository.save(member);
    }
}
