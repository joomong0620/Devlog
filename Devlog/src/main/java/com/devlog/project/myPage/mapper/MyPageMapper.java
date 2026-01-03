package com.devlog.project.myPage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.devlog.project.myPage.dto.MemberUpdateDto;

@Mapper
public interface MyPageMapper {
    
    // 내 정보 수정 (MyBatis)
    int updateMemberInfo(@Param("email") String email, @Param("dto") MemberUpdateDto dto);

    // 프로필 이미지 수정 (MyBatis)
    int updateProfileImage(@Param("email") String email, @Param("imageUrl") String imageUrl);
}