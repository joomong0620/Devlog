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
	
	@Override
	public List<ITnewsDTO> selectITnewsList() {
		return ITnewsmapper.selectjoblist();
	}

}
