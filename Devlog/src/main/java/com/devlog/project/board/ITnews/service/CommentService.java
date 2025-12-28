package com.devlog.project.board.ITnews.service;

import java.util.List;

import com.devlog.project.board.ITnews.dto.Comment;

public interface CommentService {

	// 댓글 목록 조회
	public List<Comment> select(int boardNo);

	
	// 댓글 삽입
	public int insert(Comment comment);

}
