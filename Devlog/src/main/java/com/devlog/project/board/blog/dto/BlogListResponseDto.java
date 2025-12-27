package com.devlog.project.board.blog.dto;

import java.time.format.DateTimeFormatter;

import com.devlog.project.board.blog.entity.Blog;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
public class BlogListResponseDto {
	
		private Long id;
		private String title;
		private String desc;        // 본문 요약 (JS에서 desc로 사용)
		private String authorName;
		private String thumbnailUrl;
		private int viewCount;
		private int commentCount;
		private int likeCount;      // 좋아요 수 (JS에서 likeCount로 사용)
	    private String time;        // 화면 표기용 날짜 (JS에서 time으로 사용)
		
	 // Entity -> DTO 변환 로직
	    public BlogListResponseDto(Blog entity) {
	        this.id = entity.getId();
	        this.title = entity.getTitle();
	        this.authorName = entity.getAuthorName();
	        this.thumbnailUrl = entity.getThumbnailUrl();
	        this.viewCount = entity.getViewCount();
	        this.commentCount = entity.getCommentCount();
	        this.likeCount = entity.getLikeCount();
	        
	        // 날짜 포맷 (예: 2024-12-26)
	        this.time = entity.getCreatedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

	        // 본문 내용이 길면 50자로 자르고 '...' 붙이기
	        if (entity.getContent() != null && entity.getContent().length() > 50) {
	            this.desc = entity.getContent().substring(0, 50) + "...";
	        } else {
	            this.desc = entity.getContent();
	        }
	    }
}
