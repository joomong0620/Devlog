package com.devlog.project.board.ITnews.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

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
		System.out.println(itnews);
		model.addAttribute("itnews", itnews);
		
		return "board/ITnews/ITnewsList";
	}
	
	
	
}
