package com.devlog.project.board.jobposting.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class JobPostingServiceImpl implements JobPostingService {
	@Scheduled(cron = "0 1 1 * * *") // 초 분 시 일 월 요일
	public void JobCrawler() {
		System.out.println(">>> JobCrawler() 메서드 진입 성공!");
	    try {
	        String projectPath = System.getProperty("user.dir");
	        
	        String scriptPath = projectPath + File.separator + "scripts" + File.separator + "Jobposting.py";
	        
	        System.out.println("크롤링 프로세스 시작: " + scriptPath);

	        // ProcessBuilder 설정
	        ProcessBuilder pb = new ProcessBuilder("python", scriptPath);
	        pb.redirectErrorStream(true);
	        
	        Process process = pb.start();

	        // 자바 콘솔에서 버퍼 읽기
	        try (BufferedReader reader = new BufferedReader(
	                new InputStreamReader(process.getInputStream(), "UTF-8"))) {
	            String line;
	            while ((line = reader.readLine()) != null) {
	                System.out.println("Python Log " + line);
	            }
	        }

	        int exitCode = process.waitFor();
	        System.out.println(" 크롤링 프로세스 종료. Exit Code: " + exitCode);

	    } catch (Exception e) {
	        System.err.println("에러 발생");
	        e.printStackTrace();
	    }
	}
}
