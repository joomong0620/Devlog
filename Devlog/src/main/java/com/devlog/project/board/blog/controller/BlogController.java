package com.devlog.project.board.blog.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.devlog.project.board.blog.dto.BlogListResponseDto;
import com.devlog.project.board.blog.service.BlogService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class BlogController {

	private final BlogService blogService;

	// 블로그 목록 조회 (blogList.html)
	@GetMapping("/blog/list")
	public String blogList(Model model,
			@PageableDefault(size = 12, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

		// 1페이지(최신글 12개)를 가져와서 HTML에 미리 심어줌 (SSR)
		Page<BlogListResponseDto> list = blogService.getBlogList(pageable);
		model.addAttribute("blogList", list.getContent());

		// HTML 파일 위치: src/main/resources/templates/board/blog/blogList.html
		return "board/blog/blogList";
	}
	
	// 스크롤 내릴 때 데이터만 주기 (URL: /api/blog/list)
    @GetMapping("/api/blog/list")
    @ResponseBody // HTML 말고 데이터(JSON)만 반환
    public Page<BlogListResponseDto> getBlogListApi(
            @PageableDefault(size = 12, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        
        return blogService.getBlogList(pageable);
    }
	
	
	
	

}