package com.devlog.project.board.blog.controller;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    
    // 8. 블로그 상세 게시글 조회 (수정됨)
    @GetMapping("/blog/detail/{boardNo}")
    public String blogDetail(@PathVariable Long boardNo, Model model,
                             HttpServletRequest request, HttpServletResponse response) {

        // 1. 로그인 정보 가져오기
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String loginEmail = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) 
                            ? auth.getName() : null;

        // 2. 조회수 중복 방지 (쿠키)
        Cookie oldCookie = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("postView")) {
                    oldCookie = cookie;
                }
            }
        }

        if (oldCookie != null) {
            if (!oldCookie.getValue().contains("[" + boardNo + "]")) {
                blogService.increaseViewCount(boardNo);
                oldCookie.setValue(oldCookie.getValue() + "_[" + boardNo + "]");
                oldCookie.setPath("/");
                oldCookie.setMaxAge(60 * 60 * 24);
                response.addCookie(oldCookie);
            }
        } else {
            blogService.increaseViewCount(boardNo);
            Cookie newCookie = new Cookie("postView", "[" + boardNo + "]");
            newCookie.setPath("/");
            newCookie.setMaxAge(60 * 60 * 24);
            response.addCookie(newCookie);
        }

        // 3. 게시글 데이터 가져오기
        BlogDTO post = blogService.getBoardDetail(boardNo);
        
        // [디버깅] 여기서 null이면 목록으로 튕겨냄
        if (post == null) {
            System.out.println(">>> 게시글이 존재하지 않습니다. 번호: " + boardNo);
            return "redirect:/blog/list";
        }

        // 4. 유료 글 잠금 체크
        boolean isLocked = false;
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

        // 5. 로그인 유저 정보 (잔액 등)
        if (loginEmail != null) {
            Member loginUser = memberRepository.findByMemberEmailAndMemberDelFl(loginEmail, CommonEnums.Status.N).orElse(null);
            if(loginUser != null) {
                model.addAttribute("loginUser", loginUser);
            }
        }

        // 6. [중요] 화면으로 데이터 보내기 (이 부분이 핵심!)
        model.addAttribute("post", post);        // <-- 이게 없으면 에러남
        model.addAttribute("isLocked", isLocked);

        System.out.println(">>> 화면으로 데이터 전송 완료: " + post.getBoardTitle()); // 확인용 로그

        return "board/blog/blogDetail";
    }
    
    // 팔로워 / 팔로잉 목록 API (모달 연동용)

    // 9. 팔로워 목록 조회
    @GetMapping("/api/blog/{blogId}/followers")
    @ResponseBody
    public ResponseEntity<List<UserProfileDto>> getFollowers(@PathVariable String blogId) {
        // 1. 내 정보 찾기
        Member me = getMyMember(); // *하단 헬퍼 메소드 참고
        
        // 2. 서비스 호출 (내 정보 전달)
        List<UserProfileDto> list = blogService.getFollowList(blogId, "follower", me);
        return ResponseEntity.ok(list);
    }

    // 10. 팔로잉 목록 조회
    @GetMapping("/api/blog/{blogId}/followings")
    @ResponseBody
    public ResponseEntity<List<UserProfileDto>> getFollowings(@PathVariable String blogId) {
        Member me = getMyMember();
        List<UserProfileDto> list = blogService.getFollowList(blogId, "following", me);
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
    
    // 게시글 좋아요
    @PostMapping("/api/blog/like/{boardNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> toggleBoardLike(@PathVariable Long boardNo) {
        Member me = getMyMember(); // 헬퍼 메서드 사용
        if (me == null) return ResponseEntity.status(401).body(Map.of("message", "로그인 필요"));

        boolean isLiked = blogService.toggleBoardLike(boardNo, me.getMemberNo());
        
        // 최신 좋아요 개수 가져오기 (UI 갱신용)
        BlogDTO post = blogService.getBoardDetail(boardNo);
        
        return ResponseEntity.ok(Map.of("success", true, "isLiked", isLiked, "count", post.getLikeCount()));
    }
    
    // 게시글 수정 화면으로 이동하는 메서드
    @GetMapping("/blog/edit/{boardNo}")
    public String blogEdit(@PathVariable Long boardNo, Model model) {
        
        // 1. 로그인 체크
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return "redirect:/member/login";
        }

        // 2. 수정할 게시글 데이터 가져오기
        BlogDTO post = blogService.getBoardDetail(boardNo);
        
        // 3. 게시글이 없으면 목록으로 리턴
        if (post == null) {
            return "redirect:/blog/list";
        }
        
        // 4. 본인 글인지 확인 (다르면 상세 페이지로 튕겨내기)
        String loginEmail = auth.getName();
        if (!post.getMemberEmail().equals(loginEmail)) {
            return "redirect:/blog/detail/" + boardNo;
        }

        // 5. 모델에 데이터 담기 (이게 있어야 화면에 글 내용이 채워짐)
        System.out.println("수정 화면 진입 - 글 번호: " + post.getBoardNo());
        model.addAttribute("post", post);
        
        // 6. 작성 페이지(blogWrite.html)를 재활용
        return "board/blog/blogWrite";
    }
    
    // 게시글 수정 처리 API
    @PostMapping("/api/blog/update")
    @ResponseBody
    public ResponseEntity<String> updateBlog(@RequestBody BlogDTO blogDTO) {
        // 1. 로그인 체크
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        
        // 2. 서비스 호출 (본인 확인은 Service 내부에서 처리하는 것이 안전)
        // 현재 로그인한 사용자 이메일을 DTO에 담아서 보냄 (검증용)
        blogDTO.setMemberEmail(auth.getName());
        
        try {
            blogService.updateBlog(blogDTO);
            return ResponseEntity.ok("수정 성공");
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body("수정 권한이 없습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("수정 중 오류 발생");
        }
    }
    
    // 헬퍼 메서드 (반복해서 쓰는거 이걸로 씀)
    private Member getMyMember() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String email = auth.getName();
            return memberRepository.findByMemberEmailAndMemberDelFl(email, CommonEnums.Status.N).orElse(null);
        }
        return null;
    }

    
}