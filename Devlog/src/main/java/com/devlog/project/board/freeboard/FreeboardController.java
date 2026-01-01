package com.devlog.project.board.freeboard;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.devlog.project.board.freeboard.model.service.FreeboardService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/board")  
@RequiredArgsConstructor
public class FreeboardController {

	private final FreeboardService freeboardService;
	
	// 게시글 목록조회
	@GetMapping("/freeboard")   
	public String selectFreeboardList(
			@RequestParam(value="cp", required=false, defaultValue ="1") int cp 
			, Model model 
			, @RequestParam Map<String, Object> paramMap 
			, HttpSession session //// session에 담긴 "loginMember" 꺼내오기용
			) {  
		int boardCode = 3; // boardCode = 3:  freeboard in BoardType 테이블
		
		log.info("[ FreeboardController ] boardCode: {}, cp: {}", boardCode, cp); 			
		
		// 게시글 목록 조회 서비스 호출
		Map<String, Object> map = freeboardService.selectFreeboardList(boardCode, cp);		
		
		//log.info("Freeboard DB 목록조회, map.pagination, map.freeboardList : {}", map);
		
		// 조회 결과를 request scope에 세팅 후 forward
		model.addAttribute("map", map); //model : spring에서 사용하는 데이터 전달 객체 => js에서 이걸 받아 사용 (@PathVariable에 담긴 boardCode와 cp도 담겨져 넘어감)
				
		return "board/freeboard/freeboardList"; 
	}	
	
}
