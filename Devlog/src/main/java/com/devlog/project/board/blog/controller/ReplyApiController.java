package com.devlog.project.board.blog.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.devlog.project.board.blog.dto.PaymentRequestDto;
import com.devlog.project.board.blog.dto.ReplyDto;
import com.devlog.project.board.blog.service.ReplyService;
import com.devlog.project.member.enums.CommonEnums;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ReplyApiController {
	
	private final ReplyService replyService;
	private final MemberRepository memberRepository;
	
	// 댓글 조회
    @GetMapping("/api/posts/{postId}/comments")
    public List<ReplyDto> getComments(@PathVariable Long postId) {
        return replyService.getComments(postId);
    }
    
    // 댓글 작성
    @PostMapping("/api/comments")
    public ResponseEntity<?> addComment(@RequestBody ReplyDto reply) {
        Member m = getMe();
        // 로그인 안 한 상태면 401(권한 없음)에러 보내기
        if (m == null) return ResponseEntity.status(401).body("로그인 필요");
        
        reply.setMemberNo(m.getMemberNo());
        replyService.writeComment(reply);
        return ResponseEntity.ok(Map.of("message", "등록 성공"));
    }
    
    // 댓글 삭제
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        replyService.deleteComment(commentId);
        return ResponseEntity.ok("삭제 성공");
    }
    
    // 댓글 수정
    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable Long commentId, @RequestBody Map<String, String> body) {
        ReplyDto dto = new ReplyDto();
        dto.setCommentNo(commentId);
        dto.setCommentContent(body.get("content"));
        replyService.updateComment(dto);
        return ResponseEntity.ok("수정 성공");
    }
    
    // 결제 요청
    @PostMapping("/api/payment/purchase")
    public ResponseEntity<?> purchase(@RequestBody PaymentRequestDto req) {
        Member m = getMe();
        if (m == null) return ResponseEntity.status(401).body("로그인 필요");

        try {
            replyService.purchasePost(req.getPostId(), m.getMemberNo(), req.getAmount());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    // 로그인 유저 헬퍼 메서드
    private Member getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return memberRepository.findByMemberEmailAndMemberDelFl(email, CommonEnums.Status.N).orElse(null);
    }
    
    
}
