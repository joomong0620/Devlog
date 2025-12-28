package com.devlog.project.board.ITnews.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.devlog.project.board.ITnews.dto.Comment;
import com.devlog.project.board.ITnews.service.CommentService;

@RestController
public class CommentController {

	@Autowired
	private CommentService service;

	// 댓글 목록 조회
	@GetMapping(value = "/ITnews/comment", produces = "application/json; charset=UTF-8")
	// 한글 반환 시 인코딩 깨짐 문제 발생 -> produces 속성 작성!
	public List<Comment> select(int boardNo) {
		return service.select(boardNo);
	}
	
	
	
	// 댓글 삽입
	@PostMapping("/ITnews/comment")
	public int insert(@RequestBody Comment comment) {
		return service.insert(comment);
	}
}
