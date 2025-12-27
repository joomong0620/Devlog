package com.devlog.project.board.blog.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.devlog.project.board.blog.dto.BlogListResponseDto;
import com.devlog.project.board.blog.entity.Blog;
import com.devlog.project.board.blog.repository.BlogRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogService {
	
	private final BlogRepository blogRepository;

	public Page<BlogListResponseDto> getBlogList(Pageable pageable) {
		Page<Blog> blogPage = blogRepository.findAll(pageable);
		return blogPage.map(BlogListResponseDto::new);
	}
	
	
}
