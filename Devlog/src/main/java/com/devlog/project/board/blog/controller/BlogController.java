package com.devlog.project.board.blog.controller;

import java.util.Collections;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.board.blog.dto.BlogListResponseDto;
import com.devlog.project.board.blog.dto.BlogWriteRequestDto;
import com.devlog.project.board.blog.dto.UserProfileDto;
import com.devlog.project.board.blog.service.BlogService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class BlogController {

	private final BlogService blogService;

	// 전체 블로그 목록 조회 (blogList.html)
	@GetMapping("/blog/list")
	public String blogList(Model model,
			@PageableDefault(size = 12, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

		// 1페이지(최신글 12개)를 가져와서 HTML에 미리 심어줌 (SSR)
		Page<BlogListResponseDto> list = blogService.getBlogList(pageable);
		model.addAttribute("blogList", list.getContent());

		// HTML 파일 위치: src/main/resources/templates/board/blog/blogList.html
		return "board/blog/blogList";
	}
	
	// 전체 블로그 목록 데이터(스크롤 내릴 때 데이터만 주기)
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
	
	// 내 블로그 메인 페이지
	@GetMapping("/blog/{blogId}")
    public String blogMain(@PathVariable("blogId") String blogId, Model model) {
        
        // 1. 프로필 정보 가져오기 (Service에서 DTO 변환 완료됨)
        UserProfileDto profile = blogService.getUserProfile(blogId);
        model.addAttribute("userProfile", profile);
        
        model.addAttribute("followerCount", 0);
        model.addAttribute("followingCount", 0);
        model.addAttribute("subscriberCount", 0);
        model.addAttribute("totalVisit", 0);
        model.addAttribute("postCount", 0);
        model.addAttribute("todayVisit", 0);
        model.addAttribute("tags", Collections.emptyList()); // 빈 리스트
        model.addAttribute("pickPost", null); // 인기글 없음 처리
        
        // 2. 주인 여부 확인 (로그인 유저 == URL의 blogId)
        boolean isOwner = false;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            // Spring Security가 관리하는 현재 로그인 ID
            String currentUserId = auth.getName(); 
            
            System.out.println("=== 주인 여부 확인 ===");
            System.out.println("현재 로그인한 ID (auth.getName()) : " + currentUserId);
            System.out.println("현재 접속한 블로그 ID (URL) : " + blogId);
            System.out.println("일치 여부 : " + currentUserId.equals(blogId));
            System.out.println("===================");
            // 이메일(ID)이 일치하면 주인으로 인정
            if (currentUserId.equals(blogId)) {
                isOwner = true;
            }
        }
        model.addAttribute("isOwner", isOwner);

        // myDev.html로 이동
        return "board/blog/myDev"; 
    }

    // 내 블로그 글 목록 데이터 (무한 스크롤용 API)
    @GetMapping("/api/blog/{blogId}/list")
    @ResponseBody
    public Page<BlogListResponseDto> getMyBlogListApi(
            @PathVariable("blogId") String blogId,
            @PageableDefault(size = 6, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        
        // 특정 유저(blogId)의 글만 가져오기
        return blogService.getMyBlogList(blogId, pageable);
    }
	
	
	

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}