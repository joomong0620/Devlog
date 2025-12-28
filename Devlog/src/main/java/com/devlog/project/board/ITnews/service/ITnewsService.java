package com.devlog.project.board.ITnews.service;

import java.util.List;
import java.util.Map;

import com.devlog.project.board.ITnews.dto.ITnewsDTO;

public interface ITnewsService {

	//IT뉴스 화면 전환
	List<ITnewsDTO> selectITnewsList();

	//IT뉴스 상세
	ITnewsDTO selectNewsDetail(int boardNo);

	// IT뉴스 크롤링
	void ITnewsCrawler();

	
	// 좋아요 여부 확인
	int newsLikeCheck(Map<String, Object> map);

	
	// 조회수 증가
	int updateReadCount(int boardNo);

	
	// 좋아요 처리
	int like(Map<String, Object> paramMap);



}
