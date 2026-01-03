package com.devlog.project.myPage.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class MemberUpdateDto {
	
	private String memberNickname;   // 닉네임
    private String memberCareer;     // 경력
    private String myInfoIntro;      // 소개글
    private String memberTel;        // 전화번호
    private String myInfoGit;        // 깃허브 주소
    private String myInfoHomepage;   // 홈페이지 주소
}
