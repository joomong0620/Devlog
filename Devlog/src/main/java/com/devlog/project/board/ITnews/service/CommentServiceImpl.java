package com.devlog.project.board.ITnews.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devlog.project.board.ITnews.dto.Comment;
import com.devlog.project.board.ITnews.mapper.CommentMapper;
import com.devlog.project.common.utility.Util;


@Service
public class CommentServiceImpl implements CommentService{

	
	@Autowired
	private CommentMapper mapper;
	
	// 댓글 목록 조회
	@Override
	public List<Comment> select(int boardNo) {
		return mapper.select(boardNo);
	}

	
	// 댓글 삽입
	@Override
	public int insert(Comment comment) {
		System.out.println("전달된 댓글 데이터: " + comment);
		String content = comment.getCommentContent();
	    if (content == null) return 0;
	    content = Util.XSSHandling(content);
	    if (content.trim().isEmpty()) {
	        return 0;
	    }
	    comment.setCommentContent(content);
	    int result = mapper.insert(comment);
	    return result > 0 ? comment.getCommentNo() : 0;
	}

}
