package com.devlog.project.board.freeboard.model.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.devlog.project.board.freeboard.model.dto.CommentFB;
import com.devlog.project.board.freeboard.model.mapper.FbCommentMapper;
import com.devlog.project.common.utility.Util;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FbCommentServiceImpl implements FbCommentService {

	private final FbCommentMapper mapper; 
	
	
	// 댓글 목록 조회
	@Override
	public List<CommentFB> select(Long boardNo) {
		return mapper.select(boardNo);
	}


	// 댓글 삽입
	@Override
	public Long insert(CommentFB comment) {
		// XSS 방지 처리
		comment.setCommentContent(Util.XSSHandling(comment.getCommentContent()));
		// 
		Long result = mapper.insert(comment);
				
		// 댓글 삽입 성공 시 댓글 번호 반환
		if(result > 0) result = comment.getCommentNo();
		
		return result;
	}


	// 댓글 삭제
	@Override
	public int delete(CommentFB comment) {
		// 
		return mapper.delete(comment);
	}


	// 댓글 수정
	@Override
	public int update(CommentFB comment) {
		// XSS 방지 처리
		comment.setCommentContent(Util.XSSHandling(comment.getCommentContent()));
		
		return mapper.update(comment);
	}

}
