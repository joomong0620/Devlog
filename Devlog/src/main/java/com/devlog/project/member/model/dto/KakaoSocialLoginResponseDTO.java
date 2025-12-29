package com.devlog.project.member.model.dto;


import com.devlog.project.member.model.entity.Member;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class KakaoSocialLoginResponseDTO {
    private Long socialNo;
	private String provider;
	private String providerId;
	//private MemberLoginResponseDTO member;
	private Long memberNo; // memberNo = member.getMemberNo()
}
