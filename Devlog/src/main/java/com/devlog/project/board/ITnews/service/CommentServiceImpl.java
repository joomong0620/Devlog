package com.devlog.project.board.ITnews.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devlog.project.board.ITnews.dto.Comment;
import com.devlog.project.board.ITnews.mapper.CommentMapper;
import com.devlog.project.common.utility.Util;
import com.devlog.project.notification.NotiEnums;
import com.devlog.project.notification.dto.NotifiactionDTO;
import com.devlog.project.notification.service.NotificationService;



@Service
public class CommentServiceImpl implements CommentService{

	
	@Autowired
	private CommentMapper mapper;
	
	@Autowired
	private NotificationService notiService;
	
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
	    
	    // 대댓글 알림 생성 
	    if(result > 0 && comment.getParentCommentNo() != 0) {
	    	
	    	int parentMemberNo = mapper.getParentMemberNo(comment.getParentCommentNo());
	    	
	    	if(parentMemberNo == comment.getMemberNo()) {
	    		
	    		String memberNickname = mapper.selectMemberNickname(comment.getMemberNo());
	    		
	    		NotifiactionDTO notification = NotifiactionDTO.builder()
						.sender((long) comment.getMemberNo())
						.receiver((long) parentMemberNo)
						.content(memberNickname +"님이 회원님의 댓글에 답글을 남겼습니다.")
						.preview(comment.getCommentContent())
						.type(NotiEnums.NotiType.COMMENT)
						.targetType(NotiEnums.TargetType.COMMENT)
						.targetId((long) comment.getCommentNo())
						.build();
	    		
	    		notiService.sendNotification(notification);
	    		
	    		
	    	}
	    	
	    }
	    
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
