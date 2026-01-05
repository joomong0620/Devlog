package com.devlog.project.board.blog.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class ReplyDto {
	
	private Long commentNo;         // COMMENT_NO (PK)
    private Long boardNo;           // BOARD_NO (FK)
    private Long parentCommentNo;   // PARENTS_COMMENT_NO (부모 댓글 번호)
    
    private Long memberNo;          // MEMBER_NO (작성자 FK)
    private String memberNickname;  // 작성자 닉네임 (조인)
    private String profileImg;      // 작성자 프사 (조인)
    
    private String commentContent;  // COMMENT_CONTENT (내용)
    private String cCreateDate;     // C_CREATE_DATE (작성일, String 변환)
    private String commentDelFl;    // COMMENT_DEL_FL (삭제여부 N/Y)
    private String secretYn;        // SECRET_YN (비밀글 여부)
    
    private int likeCount;          // 좋아요 수 (서브쿼리)
    
    // 내가 좋아요 눌렀는지 여부 
    private boolean isLiked;
    
    // 답글 리스트 (계층형 구조용)
    private List<ReplyDto> children = new ArrayList<>();
}
