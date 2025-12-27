package com.devlog.project.board.blog.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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
	
	
}
