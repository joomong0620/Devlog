package com.devlog.project.board.ITnews.controller;

import java.io.IOException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.devlog.project.board.ITnews.dto.ITnewsDTO;
import com.devlog.project.board.ITnews.service.ITnewsService;
import com.devlog.project.member.model.dto.MemberLoginResponseDTO;
import com.devlog.project.member.model.entity.Member;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Controller
public class ITnewsController {

	@Autowired
	private ITnewsService itnewsService;

	// IT뉴스 화면 전환
	@GetMapping("/ITnews")
	public String ITnews(Model model) {
		List<ITnewsDTO> itnews = itnewsService.selectITnewsList();
//		System.out.println(itnews);
		model.addAttribute("itnews", itnews);

		return "board/ITnews/ITnewsList";
	}

	// IT뉴스 상세
	@GetMapping("/ITnews/{boardNo:[0-9]+}")
	public String ITnewsDetail(@PathVariable("boardNo") int boardNo, Model model,
			@SessionAttribute(value = "loginMember", required = false) MemberLoginResponseDTO loginMember,
			RedirectAttributes ra, HttpServletRequest req, HttpServletResponse resp, HttpSession session)
			throws ParseException {

		// 1. 상세 데이터 조회
		ITnewsDTO news = itnewsService.selectNewsDetail(boardNo);

		int likeCount = itnewsService.countBoardLike(boardNo);
		model.addAttribute("likeCount", likeCount);

		if (news == null) {
			ra.addFlashAttribute("message", "해당 뉴스가 존재하지 않습니다.");
			return "redirect:/ITnews";
		}

		// 좋아요 여부 확인 (로그인 시)
		if (loginMember != null) {
			Map<String, Object> map = new HashMap<>();
			map.put("boardNo", boardNo);
			map.put("memberNo", loginMember.getMemberNo());

			int likeCheck = itnewsService.newsLikeCheck(map);
			if (likeCheck > 0)
				model.addAttribute("likeCheck", "yes");
		}

		// 쿠키를 이용한 조회수 증가 로직
		Cookie[] cookies = req.getCookies();
		Cookie c = null;

		if (cookies != null) {
			for (Cookie temp : cookies) {
				if (temp.getName().equals("readNewsNo")) {
					c = temp;
					break;
				}
			}
		}

		int result = 0;
		if (c == null) { // 쿠키가 없으면 새로 생성
			c = new Cookie("readNewsNo", "|" + boardNo + "|");
			result = itnewsService.updateReadCount(boardNo);
		} else { // 쿠키가 있으면 현재 게시글 번호가 포함되어 있는지 확인
			if (c.getValue().indexOf("|" + boardNo + "|") == -1) {
				c.setValue(c.getValue() + "|" + boardNo + "|");
				result = itnewsService.updateReadCount(boardNo);
			}
		}

		if (result > 0) {
			news.setBoardCount(news.getBoardCount() + 1); // DTO 데이터 갱신
			c.setPath("/"); // 모든 경로에서 쿠키 유효하게 설정

			c.setMaxAge(60 * 60 * 24); // 24시간 동안 쿠키 유지

			resp.addCookie(c);
		}

		model.addAttribute("news", news);

		boolean isAdmin = false;
		if (loginMember != null && loginMember.getMemberAdmin() != null) {
			// Enum의 상수 이름이 'Y'인지 확인
			isAdmin = loginMember.getMemberAdmin().name().equals("Y");
		}
		model.addAttribute("isAdmin", isAdmin);

		return "board/ITnews/ITnewsDetail";
	}

	// IT뉴스 크롤링
	@GetMapping("/ITnews/ITnews-crawler")
	@ResponseBody
	public void ITnewsCrawler() {
		itnewsService.ITnewsCrawler();

	}

	// 좋아요 처리
	@PostMapping("/ITnews/like")
	@ResponseBody
	public int like(@RequestBody Map<String, Object> paramMap,
			@SessionAttribute(value = "loginMember", required = false) MemberLoginResponseDTO loginMember) {

		// 로그인 안 되어 있으면 바로 -1 반환
		if (loginMember == null)
			return -1;
		System.out.println(paramMap);

		paramMap.put("memberNo", loginMember.getMemberNo());
		return itnewsService.like(paramMap);

	}

	// 관리자 게시글 삭제
	@PutMapping("/ITnews/{boardNo}/delete")
	@ResponseBody
	public int boardDelete(@PathVariable int boardNo,
			@SessionAttribute(value = "loginMember", required = false) MemberLoginResponseDTO loginMember) {
		if (loginMember == null)
			return -1;

		// 관리자 체크 필요하면 여기서
		// if(!loginMember.isAdmin()) return -1;

		return itnewsService.boardDelete(boardNo);
	}

	// 관리자 게시글 수정 화면 전환
	@GetMapping("/ITnews/{boardNo}/update")
	public String boardUpdate(@PathVariable int boardNo,
			@SessionAttribute(value = "loginMember", required = false) MemberLoginResponseDTO loginMember,
			Model model) {

		if (loginMember == null) {
			return "redirect:/ITnews";
		}

		ITnewsDTO itnews = itnewsService.selectNewsDetail(boardNo);

		if (itnews == null) {
			return "redirect:/ITnews";
		}

		model.addAttribute("itnews", itnews);
		return "board/ITnews/ITnewsUpdate";

	}

	// 게시글 수정
	@PostMapping("/ITnews/{boardNo}/update")
	public String boardUpdate(
		@PathVariable int boardNo,
		ITnewsDTO itnews, 
		@RequestParam(value="imageFile", required=false) MultipartFile imageFile, // 새 이미지
        @SessionAttribute("loginMember") MemberLoginResponseDTO loginMember // 관리자 체크용
		) throws IllegalStateException, IOException {
		 
		itnews.setBoardNo(boardNo);
		
		// 3. 서비스 호출 (기사 수정 및 이미지 처리)
		// Note: 서비스에서 itnews.getBoardCode() 등으로 접근할 수 있도록 구성
		int result = itnewsService.boardUpdate(itnews, imageFile);
				
		     
		String message = null;
		String path = "redirect:/ITnews/";    
	 
		if(result > 0) { // 게시글 수정 성공 시
			message = "게시글이 수정되었습니다.";
			return "redirect:/ITnews";
			
		}else { // 실패 시 
			message = "게시글 수정 실패 ㅠㅠ";
			path += "update";
		}
		
		return path;
	}

}
