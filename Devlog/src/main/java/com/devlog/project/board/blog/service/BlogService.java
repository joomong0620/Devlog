package com.devlog.project.board.blog.service;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication; // 추가
import org.springframework.security.core.context.SecurityContextHolder; // 추가
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.board.blog.dto.BlogListResponseDto;
import com.devlog.project.board.blog.dto.BlogWriteRequestDto;
import com.devlog.project.board.blog.dto.UserProfileDto;
import com.devlog.project.board.blog.entity.Blog;
import com.devlog.project.board.blog.repository.BlogRepository;
import com.devlog.project.member.enums.CommonEnums;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogService {
    
    private final BlogRepository blogRepository;
    private final MemberRepository memberRepository;

    // 전체 블로그 목록 조회 (메인 탐색용)
    public Page<BlogListResponseDto> getBlogList(Pageable pageable) {
        Page<Blog> blogPage = blogRepository.findAll(pageable);
        return blogPage.map(BlogListResponseDto::new);
    }
    
    // 글 작성 저장
    @Transactional
    public Long writeBlog(BlogWriteRequestDto dto) {
        
        // 1. 현재 로그인한 사용자의 아이디(이메일) 가져오기
        String currentAuthorEmail = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            // 로그인 상태라면 실제 이메일 사용
            currentAuthorEmail = auth.getName(); 
        } else {
            // [테스트용] 로그인 안 했을 경우 임시로 이메일 지정 (URL과 일치시켜야 목록이 나옴)
            // 나중에 로그인 기능 완벽하면 else 부분은 예외처리(throw new Exception) 해야 함
            currentAuthorEmail = "test@naver.com"; 
        }

        // 2. 엔티티 변환 (작성자 이메일 주입)
        // 주의: DB의 authorName 컬럼에 이제 '이메일'이 저장됩니다.
        Blog blog = dto.toEntity(currentAuthorEmail);
            
        // 3. DB 저장
        Blog savedBlog = blogRepository.save(blog);
        
        return savedBlog.getId();
    }
    @Value("${my.blogWrite.location}")
    private String uploadLocation; 
    
    @Value("${my.blogWrite.webpath}")
    private String uploadWebPath;
    
    
    // 이미지 업로드 로직
    public String uploadImage(MultipartFile image) {
        if(image == null || image.isEmpty()) return null;
        
        
        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        
        File folder = new File(uploadLocation);
        if (!folder.exists()) {
            folder.mkdirs();
        }
        
        try {
            File saveFile = new File(uploadLocation, fileName);
            image.transferTo(saveFile);
            return uploadWebPath + fileName;
            
        } catch(IOException e) {
            throw new RuntimeException("이미지 업로드 중 오류 발생", e);
        }
    }
    
    // 내 블로그 프로필 정보 가져오기
    public UserProfileDto getUserProfile(String blogId) {
        Member member = memberRepository.findByMemberEmailAndMemberDelFl(blogId, CommonEnums.Status.N)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않거나 탈퇴한 회원입니다."));
        
        return UserProfileDto.builder()
                .id(member.getMemberEmail())
                .nickname(member.getMemberNickname())
                .username(member.getMemberName())
                .job(member.getMemberCareer() != null ? member.getMemberCareer() : "개발자")
                .bio(member.getMyInfoIntro() != null ? member.getMyInfoIntro() : "소개가 없습니다.")
                .profileImgUrl(member.getProfileImg())
                .githubUrl(member.getMyInfoGit())
                .blogUrl(member.getMyInfoHomepage())
                .exp(member.getCurrentExp() != null ? member.getCurrentExp() : 0)
                .build();
    }
    
    // [핵심] 특정 유저의 블로그 글 목록 조회
    // 이제 DB에 이메일이 저장되므로, authorName(이메일)으로 조회가 가능해집니다.
    public Page<BlogListResponseDto> getMyBlogList(String authorName, Pageable pageable) {
        return blogRepository.findByAuthorName(authorName, pageable)
                .map(BlogListResponseDto::new);
    }
}