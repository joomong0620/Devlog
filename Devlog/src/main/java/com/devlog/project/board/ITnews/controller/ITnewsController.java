package com.devlog.project.board.ITnews.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.devlog.project.board.ITnews.dto.ITnewsDTO;
import com.devlog.project.board.ITnews.service.ITnewsService;

@Controller
public class ITnewsController {
	
	@Autowired
	private ITnewsService itnewsService;
	
	// IT뉴스 화면 전환
	@GetMapping("/ITnews")
	public String ITnews(
			Model model) {
		List<ITnewsDTO> itnews = itnewsService.selectITnewsList();
//		System.out.println(itnews);
		model.addAttribute("itnews", itnews);
		
		return "board/ITnews/ITnewsList";
	}
	
	
	// IT뉴스 상세
	@GetMapping("/ITnews/{boardNo:[0-9]+}")
	public String ITnewsDetail(
			@PathVariable("boardNo") int boardNo,
			Model model) {
		
		
		ITnewsDTO news = itnewsService.selectNewsDetail(boardNo);
		model.addAttribute("news", news);
//		System.out.println("가져온 뉴스 데이터: " + news);
		return "board/ITnews/ITnewsDetail";
	}
	
	
	
	
}
