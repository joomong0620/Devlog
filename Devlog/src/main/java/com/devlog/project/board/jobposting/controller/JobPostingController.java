package com.devlog.project.board.jobposting.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.devlog.project.board.jobposting.service.JobPostingService;

@Controller
public class JobPostingController {
	
	@Autowired
	private JobPostingService jobPostingService;
	
	
	// 채용공고 캘린더 이동	
	@GetMapping("/jobposting")
	public String jobposting() {
		return "board/Jobposting/calender";
	}
	
	// 채용공고 크롤링
	@GetMapping("/job-crawler")
	@ResponseBody
	public void JobCrawler() {
		jobPostingService.JobCrawler();
	}
}
