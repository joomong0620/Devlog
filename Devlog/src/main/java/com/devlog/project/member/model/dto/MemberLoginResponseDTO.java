package com.devlog.project.member.model.dto;

import com.devlog.project.member.enums.CommonEnums.Status;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberLoginResponseDTO {
	
    private Long memberNo;
    private String memberEmail;
    private String memberNickname;
    private String role; // ROLE_USER / ROLE_ADMIN; auto by spring-security
//    private Status memberAdmin; // 'N': 일반회원,  'Y':관리자
//    private Status memberSubscribe; 
//    private Status memberDelFl; // 'N': 회원,      'Y':탈퇴회원 
}

