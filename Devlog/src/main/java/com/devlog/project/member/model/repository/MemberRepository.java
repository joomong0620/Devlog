package com.devlog.project.member.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devlog.project.member.enums.CommonEnums.Status;
import com.devlog.project.member.model.entity.Member;

public interface MemberRepository extends JpaRepository<Member, Long>  {
	
    Optional<Member> findByMemberEmailAndMemberDelFl(String memberEmail, Status memberDelFl); // memberDelFl=N 회원만 조회
    
    boolean existsByMemberEmail(String memberEmail); // 회원가입중복체크
}

