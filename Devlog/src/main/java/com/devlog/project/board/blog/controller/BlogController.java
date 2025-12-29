package com.devlog.project.board.blog.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.board.blog.dto.BlogListResponseDto;
import com.devlog.project.board.blog.dto.BlogWriteRequestDto;
import com.devlog.project.board.blog.service.BlogService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
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
	
	// 블로그 목록 데이터(스크롤 내릴 때 데이터만 주기)
    @GetMapping("/api/blog/list")
    @ResponseBody // HTML 말고 데이터(JSON)만 반환
    public Page<BlogListResponseDto> getBlogListApi(
            @PageableDefault(size = 12, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        
        return blogService.getBlogList(pageable);
    }
    
    // 글 작성 화면 이동
	@GetMapping("/blog/write")
    public String blogWrite() {
    	
    	return "board/blog/blogWrite";
    }
	
	// 글 작성 처리 (API)
	@PostMapping("/api/blog/write")
	@ResponseBody
	public ResponseEntity<String> writeBlog(@RequestBody BlogWriteRequestDto requestDto){
		// @RequestBody : 프론트에서 보낸 JSON 데이터를 DTO로 매핑
		System.out.println("전송된 데이터 : " + requestDto.toString());
		blogService.writeBlog(requestDto);
		
		return ResponseEntity.ok("저장 성공");
	}
	
	// 이미지 업로드 처리
	@PostMapping("/api/blog/imageUpload")
	@ResponseBody
	public String imageUpload(@RequestParam("image") MultipartFile image) {
		// 로컬의 특정 경로에 저장한 뒤 해당 URL 반환하도록 서비스 호출
		
		return blogService.uploadImage(image);
	}
	
	
	

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}