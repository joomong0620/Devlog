package com.devlog.project.board.blog.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BlogDTO {
	
	// BOARD 테이블 공통 컬럼
    private Long boardNo;           // PK
    private int boardCode;          // 게시판 코드 (블로그: 1)
    private Long memberNo;          // FK: 작성자 회원 번호
    private String boardTitle;      // 제목
    private String boardContent;    // 내용
    private String bCreateDate;     // 작성일 (String으로 변환하여 사용)
    private int boardCount;         // 조회수
    private String boardDelFl;      // 삭제 여부 ('N', 'Y')
    
    // BLOG 테이블 전용 컬럼
    private String isPaid;          // 유료 여부 ('Y', 'N')
    private int price;              // 가격
    private String tempFl;          // 임시저장 여부 ('Y', 'N')
    
    // MEMBER 테이블 조인
    private String memberNickname;  // 작성자 닉네임 (화면에 표시될 이름)
    private String memberEmail;     // 작성자 아이디 (이메일)
    private String profileImg;      // 작성자 프로필 이미지
    
    @JsonProperty("thumbnail_url")
    private String thumbnailUrl;	// 썸네일 (프로필 or 본문이미지)
    
    private int commentCount; 		// 댓글 수
    private int likeCount;			// 좋아요 수
    
    private List<String> tagList;   // 태그 리스트 (저장/조회용)

}
