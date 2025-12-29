package com.devlog.project.board.blog.service;


import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.board.blog.dto.BlogListResponseDto;
import com.devlog.project.board.blog.dto.BlogWriteRequestDto;
import com.devlog.project.board.blog.entity.Blog;
import com.devlog.project.board.blog.repository.BlogRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogService {
	
	private final BlogRepository blogRepository;
	
	
	
	// 블로그 목록 조회
	public Page<BlogListResponseDto> getBlogList(Pageable pageable) {
		Page<Blog> blogPage = blogRepository.findAll(pageable);
		return blogPage.map(BlogListResponseDto::new); // 람다
		// 
	}
	
	// 글 작성 저장
	@Transactional
	public Long writeBlog(BlogWriteRequestDto dto) {
		
		// [임시 주석 처리] 1. 현재 로그인한 사용자의 아이디 가져오기
		// String currentAuthor = SecurityContextHolder.getContext().getAuthentication().getName();
		
		// [임시 코드] 테스트용 작성자 이름
		String currentAuthor = "테스트유저";
		// 2. 엔티티 변환 (작성자 이름 주입)
		Blog blog = dto.toEntity(currentAuthor);
			
		// 3. DB 저장
		Blog savedBlog = blogRepository.save(blog);
		
		return savedBlog.getId();
		
	}
	
    private final String baseUploadPath = "C:/DevlogImg";
	
	// 이미지 업로드 로직
	public String uploadImage(MultipartFile image) {
		if(image == null || image.isEmpty()) return null;
		
		// 1. 블로그 전용 하위 폴더 경로 설정
		String subFolder = "board/blog/blogWriteImg/";
		String fullPath = baseUploadPath + subFolder;
		
		// 2. 파일명 생성 (UUID로 중복 방지)
		String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
		
		// 3. 폴더가 없으면 생성 (blog와 blog와 blogWriteImg 폴더를 한꺼번에 생성)
		File folder = new File(fullPath);
		
		if (!folder.exists()) {
			folder.mkdirs();
		}
		
		try {
			// 4. 파일 물리적 저장
			File saveFile = new File(fullPath, fileName);
			image.transferTo(saveFile);
			
			// 5. 웹에서 접근 가능한 URL 경로 반환
			return "/images/" + subFolder + fileName;
		}catch(IOException e) {
			throw new RuntimeException("이미지 업로드 중 오류 발생", e);
		}
		
	}

	
	
}
