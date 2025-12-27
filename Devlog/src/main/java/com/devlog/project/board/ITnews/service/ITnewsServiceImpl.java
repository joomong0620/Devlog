package com.devlog.project.board.ITnews.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devlog.project.board.ITnews.dto.ITnewsDTO;
import com.devlog.project.board.ITnews.mapper.ITnewsMapper;

@Service
public class ITnewsServiceImpl implements ITnewsService{

	
	@Autowired
	private ITnewsMapper ITnewsmapper;
	
	// 뉴스 목록 조회
	@Override
	public List<ITnewsDTO> selectITnewsList() {
		return ITnewsmapper.selectjoblist();
	}

	// 뉴스 상세 조회
	@Override
	public ITnewsDTO selectNewsDetail(int boardNo) {
		return ITnewsmapper.selectNewsDetail(boardNo);
	}

}
