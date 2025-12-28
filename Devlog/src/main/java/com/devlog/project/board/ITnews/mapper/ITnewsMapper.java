package com.devlog.project.board.ITnews.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.devlog.project.board.ITnews.dto.ITnewsDTO;

@Mapper
public interface ITnewsMapper {

	// IT뉴스 리스트 이동
	public List<ITnewsDTO> selectITnewsList();

	// IT뉴스 상세
	public ITnewsDTO selectNewsDetail(int boardNo);

	// 좋아요 여부 확인
	public int newsLikeCheck(Map<String, Object> map);

	// 조회수 증가
	public int updateReadCount(int boardNo);

	
	// 좋아요 테이블 삽입
	public int insertBoardLike(Map<String, Object> paramMap);

	
	// 좋아요 테이블 삭제
	public int deleteBoardLike(Map<String, Object> paramMap);

	
	// 좋아요 수 조회
	public int countBoardLike(Object object);



}
