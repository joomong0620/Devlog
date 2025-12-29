package com.devlog.project.board.ITnews.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
	@Transactional
	@Override
	public int insert(Comment comment) {
//	    System.out.println("전달받은 comment 객체: " + comment);
	    
	    String content = comment.getCommentContent();
	    if (content == null) return 0;
	    
	    content = Util.XSSHandling(content);
	    if (content.trim().isEmpty()) {
	        return 0;
	    }
	    comment.setCommentContent(content);
	    
//	    System.out.println("DB 삽입 직전 객체: " + comment);
	    
	    int result = mapper.insert(comment);
	    
//	    System.out.println("Mapper 반환값: " + result);
	    
	    return result > 0 ? comment.getCommentNo() : 0;
	}

	
	// 댓글 수정
	@Override
	public int update(Comment comment) {
		return mapper.update(comment);
	}

	// 댓글 삭제
	@Override
	public int delete(Comment comment) {
		return mapper.delete(comment);
	}

}
