package com.devlog.project.board.blog.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileDto {
    private String id;              // 이메일 (Member.memberEmail)
    private String nickname;        // 닉네임 (Member.memberNickname)
    private String username;        // 실명 (Member.memberName)
    private String job;             // 직업 (Member.memberCareer)
    private String bio;             // 소개 (Member.myInfoIntro)
    private String profileImgUrl;   // 프로필 (Member.profileImg)
    private String githubUrl;       // 깃허브 (Member.myInfoGit)
    private String blogUrl;         // 홈페이지 (Member.myInfoHomepage)
    private int exp;                // 경험치 (Member.currentExp)
}