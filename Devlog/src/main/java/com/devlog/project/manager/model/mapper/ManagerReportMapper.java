package com.devlog.project.manager.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ManagerReportMapper {

	// 게시글 조회
    int selectBoardCode(@Param("boardNo") Long boardNo);
    
    // 게시글 삭제
    void deleteBoard(Long boardNo);
    
    // 게시글 삭제 여부 조회
    int isBoardDeleted(Long boardNo);
}