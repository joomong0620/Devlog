package com.devlog.project.board.ITnews.service;

import java.util.List;

import com.devlog.project.board.ITnews.dto.ITnewsDTO;

public interface ITnewsService {

	//IT뉴스 화면 전환
	List<ITnewsDTO> selectITnewsList();

	//IT뉴스 상세
	ITnewsDTO selectNewsDetail(int boardNo);



}
