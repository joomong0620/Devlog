package com.devlog.project.board.freeboard.model.service;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.RowBounds;
import org.springframework.stereotype.Service;

import com.devlog.project.board.freeboard.model.dto.Freeboard;
import com.devlog.project.board.freeboard.model.dto.PaginationFB;
import com.devlog.project.board.freeboard.model.mapper.FreeboardMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FreeboardServiceImpl implements FreeboardService {

	private final FreeboardMapper mapper;
	
	@Override
	public List<Map<String, Object>> selectBoardTypeList() {
		return mapper.selectBoardTypeList();
	}
	
	// 게시글 목록 조회	
	@Override                  
	public Map<String, Object> selectFreeboardList(int boardCode, int cp) {
		// 1. 특정 게시판의 삭제되지 않은 게시글 수 조회
		int listCount = mapper.getFreeboardListCount(boardCode);
		
		
	    // 2. 1번의 조회 결과 + cp를 이용해서 Pagination 객체 생성
	    PaginationFB pagination = new PaginationFB(cp, listCount);

	    // 3. 특정 게시판에서 현재 페이지에 해당하는 부분에 대한 게시글 목록 조회
	    // -> 어떤 게시판(boardCode)에서
	    //    몇 페이지(pagination.currentPage)에 대한
	    //    게시글 몇 개 (pagination.limit) 조회

	    // 1) offset 계산
	    int offset = (pagination.getCurrentPage() - 1) * pagination.getLimit();

	    // 2) RowBounds 객체 생성
	    RowBounds rowBounds = new RowBounds(offset, pagination.getLimit());

	    List<Freeboard> freeboardList = mapper.selectFreeboardList(boardCode, rowBounds); 

	    // 4. pagination, boardList를 Map에 담아서 반환
	    Map<String, Object> map = new HashMap<String, Object>();
	    map.put("pagination", pagination);
	    map.put("freeboardList", freeboardList);
	    
	    return map;
	}

	@Override
	public Freeboard selectFreeboardDetail(Map<String, Object> map) {
		
	      return mapper.selectFreeboardDetail(map);
	}

}

