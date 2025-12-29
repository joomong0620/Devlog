package com.devlog.project.board.ITnews.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.devlog.project.board.ITnews.dto.Comment;

@Mapper
public interface CommentMapper {

	// 댓글 목록 조회
	public List<Comment> select(int boardNo);

	// 댓글 삽입
	public int insert(Comment comment);

	
	// 댓글 수정
	public int update(Comment comment);

	
	// 댓글 삭제
	public int delete(Comment comment);

}
