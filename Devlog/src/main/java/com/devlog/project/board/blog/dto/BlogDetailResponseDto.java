package com.devlog.project.board.blog.dto;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.devlog.project.board.blog.entity.Blog;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class BlogDetailResponseDto {
	private Long id;
	private String title;
	private String content;
	private String thumbnailUrl;
	
	// 작성자 정보
	private String writerId; // 이메일
	private String writerNickname; // 닉네임 
	
	// 메타 정보
	private LocalDateTime createdDate;
	private int viewCount;
	private int commentCount;
	private int likeCount;
	
	// 유료 관련
	private int price;
	private boolean isPaidContent; // 콘텐츠 자체 유료 여부
	
	private List<String> tags;
	
	// Entity -> DTO 변환 (작성자 닉네임 별도 주입)
	public BlogDetailResponseDto(Blog entity, String writerNickname) {
		this.id = entity.getId();
		this.title = entity.getTitle();
		this.content = entity.getContent();
		this.thumbnailUrl = entity.getThumbnailUrl();
		
		this.writerId = entity.getAuthorName(); // BlogService에서 authorName에 이메일 저장함
		this.writerNickname = writerNickname; // Member 테이블에서 조회
		
		this.createdDate = entity.getCreatedDate();
		this.viewCount = entity.getViewCount();
		this.commentCount = entity.getCommentCount();
		this.likeCount = entity.getLikeCount();
		
		this.price = entity.getPrice();
		this.isPaidContent = entity.isPaid();
		
		// 태그 파싱
		if(entity.getTags() != null && !entity.getTags().isEmpty()) {
			this.tags = Arrays.asList(entity.getTags().split(","));
		}else {
			this.tags = Collections.emptyList();
		}
		
	}
	
}
