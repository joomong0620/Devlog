package com.devlog.project.board.ITnews.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.devlog.project.board.ITnews.dto.ITnewsDTO;

@Mapper
public interface ITnewsMapper {

	// IT뉴스 리스트 이동
	public List<ITnewsDTO> selectjoblist();

	// IT뉴스 상세
	public ITnewsDTO selectNewsDetail(int boardNo);

}
