package com.devlog.project.board.freeboard.model.mapper;


import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.session.RowBounds;

import com.devlog.project.board.freeboard.model.dto.Freeboard;


@Mapper
public interface FreeboardMapper {
	
	// 게시판 종류 조회
	public List<Map<String, Object>> selectBoardTypeList();	
	
    // Freeboard 게시판(boardCode=3)의 삭제되지 않은 게시글 수 조회 
	public int getFreeboardListCount(int boardCode);

	// Freeboard 게시판(boardCode=3)에서 현재 페이지에 해당하는 부분에 대한 게시글 목록 조회
	public List<Freeboard> selectFreeboardList(int boardCode, RowBounds rowBounds);

	// Freeboard 게시판(boardCode=3)에서 boardNo 에 해당하는 게시글 상세 조회
	public Freeboard selectFreeboardDetail(Map<String, Object> map);	

}
