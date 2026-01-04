package com.devlog.project.board.blog.controller;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.board.blog.dto.BlogDTO;
import com.devlog.project.board.blog.dto.MyBlogResponseDto;
import com.devlog.project.board.blog.dto.UserProfileDto;
import com.devlog.project.board.blog.service.BlogService;
import com.devlog.project.board.blog.service.BlogServiceImpl;
import com.devlog.project.board.blog.service.ReplyService;
import com.devlog.project.member.enums.CommonEnums;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class BlogController {

	private final BlogService blogService;
	private final ReplyService replyService;
	private final MemberRepository memberRepository;
	

	// 1. 블로그 목록 화면
	@GetMapping("/blog/list")
	public String blogList(Model model,
			@PageableDefault(size = 12, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

		Map<String, Object> result = blogService.getBlogList(pageable.getPageNumber(), pageable.getPageSize(), "id");
		model.addAttribute("blogList", result.get("content"));
		return "board/blog/blogList";
	}

	// 2. 블로그 목록 데이터 (API)
	@GetMapping("/api/blog/list")
	@ResponseBody
	public Map<String, Object> getBlogListApi(
			@PageableDefault(size = 12, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

		String sortProp = pageable.getSort().stream().findFirst().map(Sort.Order::getProperty).orElse("id");
		return blogService.getBlogList(pageable.getPageNumber(), pageable.getPageSize(), sortProp);
	}

	// 3. 글 작성 화면
	@GetMapping("/blog/write")
	public String blogWrite() {
		// 로그인 체크
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            // 로그인 안 했으면 로그인 페이지로 리다이렉트 (alert 띄우고 보내고 싶으면 JS 처리 필요하지만 일단 리다이렉트)
            return "redirect:/member/login"; 
        }
		
		return "board/blog/blogWrite";
	}
                      
	// 4. 글 작성 처리 (API)
	@PostMapping("/api/blog/write")
	@ResponseBody
	public ResponseEntity<String> writeBlog(@RequestBody BlogDTO blogDTO) {
		blogService.writeBlog(blogDTO);
		return ResponseEntity.ok("저장 성공");
	}

	// 5. 이미지 업로드
	@PostMapping("/api/blog/imageUpload")
	@ResponseBody
	public String imageUpload(@RequestParam("image") MultipartFile image) {
		return blogService.uploadImage(image);
	}


	@GetMapping("/blog/{blogId:.+}") 
    public String blogMain(@PathVariable("blogId") String blogId, Model model) {
        
        // 1. 현재 로그인한 사용자 ID 가져오기
        String currentLoginId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            currentLoginId = auth.getName();
        }

        try {
        	
        	// 1. [NEW] 방문자 수 증가 (본인 블로그가 아닐 때만 증가시키는 로직을 넣어도 됨)
            // 블로그 주인 찾기
            Member owner = memberRepository.findByMemberEmailAndMemberDelFl(blogId, CommonEnums.Status.N).orElse(null);
            
            if (owner != null) {
                // 로그인 안 했거나, 로그인 했어도 내 블로그가 아니면 방문수 증가
                if (currentLoginId == null || !currentLoginId.equals(blogId)) {
                    blogService.increaseVisitCount(owner.getMemberNo());
                }
            }
            
            // 2. 서비스에 내 블로그 화면 데이터 요청
            MyBlogResponseDto myBlogData = blogService.getMyBlogPageData(blogId, currentLoginId);
            
            // 3. 모델에 담기
            model.addAttribute("userProfile", myBlogData.getUserProfile());
            model.addAttribute("isOwner", myBlogData.isOwner());
            // 인기글 정보
            model.addAttribute("pickPost", myBlogData.getPickPost());
            // 태그 리스트
            model.addAttribute("tags", myBlogData.getTags());
            
            // 통계 데이터들
            model.addAttribute("followerCount", myBlogData.getFollowerCount());
            model.addAttribute("followingCount", myBlogData.getFollowingCount());
            model.addAttribute("subscriberCount", myBlogData.getSubscriberCount());
            model.addAttribute("totalVisit", myBlogData.getTotalVisit());
            model.addAttribute("postCount", myBlogData.getPostCount());
            model.addAttribute("todayVisit", myBlogData.getTodayVisit());
            
         // 4. 내가 팔로우 중인지 여부 확인
            boolean isFollowing = false;
            if (currentLoginId != null && owner != null) {
                Member me = memberRepository.findByMemberEmailAndMemberDelFl(currentLoginId, CommonEnums.Status.N).orElse(null);
                if (me != null) {
                    isFollowing = blogService.isFollowing(me.getMemberNo(), owner.getMemberNo());
                }
            }
            model.addAttribute("isFollowing", isFollowing);

        } catch (Exception e) {
            e.printStackTrace();
            return "redirect:/blog/list";
        }

        model.addAttribute("blogId", blogId); // JS용 ID
        return "board/blog/myDev";
    }
	
	// 팔로우 토글 API
    @PostMapping("/api/blog/follow/{targetId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> toggleFollow(@PathVariable String targetId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }
        
        String myEmail = auth.getName();
        Member me = memberRepository.findByMemberEmailAndMemberDelFl(myEmail, CommonEnums.Status.N).orElse(null);
        Member target = memberRepository.findByMemberEmailAndMemberDelFl(targetId, CommonEnums.Status.N).orElse(null);

        if(me == null || target == null) return ResponseEntity.badRequest().build();

        // ServiceImpl 캐스팅 또는 인터페이스 수정 필요
        boolean isFollowed = blogService.toggleFollow(me.getMemberNo(), target.getMemberNo());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "isFollowed", isFollowed
        ));
    }

	// 7. 내 블로그 목록 (API) - [수정] type 파라미터 받기
    @GetMapping("/api/blog/{blogId:.+}/list")
    @ResponseBody
    public Map<String, Object> getMyBlogListApi(@PathVariable("blogId") String blogId,
            @RequestParam(value = "type", required = false, defaultValue = "all") String type, // [추가]
            @PageableDefault(size = 6, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        String sortProp = pageable.getSort().stream().findFirst().map(Sort.Order::getProperty).orElse("id");
        
        // Service로 type 전달
        return blogService.getMyBlogList(blogId, type, pageable.getPageNumber(), pageable.getPageSize(), sortProp);
    }
    
    // 8. 블로그 상세 게시글 조회
    @GetMapping("/blog/detail/{boardNo}")
    public String blogDetail(@PathVariable Long boardNo, Model model) {
    	
    	// 1. 로그인 체크
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String loginEmail = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) 
                            ? auth.getName() : null;

        // 2. 게시글 조회
        BlogDTO post = blogService.getBoardDetail(boardNo);
        if (post == null) return "redirect:/blog/list";

        // 3. 유료글 잠금 체크
        boolean isLocked = false;
        
        // 게시글에 가격이 있고, 로그인 안 했거나 내 글이 아닐 때
        if (post.getPrice() > 0 && (loginEmail == null || !post.getMemberEmail().equals(loginEmail))) {
            boolean isPurchased = false;
            if (loginEmail != null) {
                Member me = memberRepository.findByMemberEmailAndMemberDelFl(loginEmail, CommonEnums.Status.N).orElse(null);
                if (me != null) {
                    isPurchased = replyService.isPurchased(boardNo, me.getMemberNo());
                }
            }
            if (!isPurchased) isLocked = true;
        }

        // 4. 내 정보 (잔액 등)
        if (loginEmail != null) {
            // JPA 써서 내 정보 가져오기
        	Member loginUser = memberRepository.findByMemberEmailAndMemberDelFl(loginEmail, CommonEnums.Status.N).orElse(null);
            // null 이면 모델 안 담고 끝냄 (에러 발생 x)
        	if(loginUser != null) {
            	model.addAttribute("loginUser", loginUser);
            }
        }

        model.addAttribute("post", post);
        model.addAttribute("isLocked", isLocked);

        return "board/blog/blogDetail";
    }
    
 // ====================================================
    // [추가] 팔로워 / 팔로잉 목록 API (모달 연동용)
    // ====================================================

    // 9. 팔로워 목록 조회
    @GetMapping("/api/blog/{blogId}/followers")
    @ResponseBody
    public ResponseEntity<List<UserProfileDto>> getFollowers(@PathVariable String blogId) {
        // Service의 getFollowList 호출 (type="follower")
        List<UserProfileDto> list = blogService.getFollowList(blogId, "follower");
        return ResponseEntity.ok(list);
    }

    // 10. 팔로잉 목록 조회
    @GetMapping("/api/blog/{blogId}/followings")
    @ResponseBody
    public ResponseEntity<List<UserProfileDto>> getFollowings(@PathVariable String blogId) {
        // Service의 getFollowList 호출 (type="following")
        List<UserProfileDto> list = blogService.getFollowList(blogId, "following");
        return ResponseEntity.ok(list);
    }
    
    // 11. 구독자 목록 조회 (현재 로직상 준비 안됨, 추후 구현 필요)
    // 현재 JS에서는 /subscribers 를 호출하므로 빈 리스트라도 리턴해야 에러가 안 남
    @GetMapping("/api/blog/{blogId}/subscribers")
    @ResponseBody
    public ResponseEntity<List<UserProfileDto>> getSubscribers(@PathVariable String blogId) {
        // TODO: 추후 구독(Payment) 로직 구현 시 Mapper/Service 추가 필요
        // 현재는 빈 리스트 반환
        return ResponseEntity.ok(List.of()); 
    }
    

    
}