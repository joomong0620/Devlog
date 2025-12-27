package com.devlog.project.board.jobposting.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.devlog.project.board.jobposting.dto.JobPostingDTO;
import com.devlog.project.board.jobposting.service.JobPostingService;

@Controller
public class JobPostingController {
	
	@Autowired
	private JobPostingService jobPostingService;
	
	
	// 채용공고 캘린더 화면 전환
	@GetMapping("/jobposting")
	public String jobposting(
			Model model) {
		List<JobPostingDTO> jobcalender = jobPostingService.selectjoblist();
//		System.out.println(jobcalender);
		model.addAttribute("jobcalender", jobcalender);
		
		return "board/Jobposting/calender";
	}
	
	// 채용공고 크롤링
	@GetMapping("/job-crawler")
	@ResponseBody
	public void JobCrawler() {
		jobPostingService.JobCrawler();
	}
	
	
	// 채용공고 상세 이동
	@GetMapping("/jobposting/{id}")
	public String jobPostingDetail(
			@PathVariable Long id,
			Model model) {
		
		JobPostingDTO detail = jobPostingService.selectDetail(id);
		model.addAttribute("job", detail);
		System.out.println(detail);
		
		return "board/Jobposting/jobpostDetail"; 
	}
	
	
	
	
	
	
	
	
}
