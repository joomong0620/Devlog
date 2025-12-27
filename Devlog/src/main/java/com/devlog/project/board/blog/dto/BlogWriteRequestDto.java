package com.devlog.project.board.blog.dto;

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
public class BlogWriteRequestDto {
	
	private String title;
	private String content;
	private List<String> tags; // JS에서 배열로 넘어오니까 List로 받는다.
	private Boolean isPaid;
	private Integer price; // int는 초기값이 0
	
	// DTO -> Entity 변환 메서드
	public Blog toEntity(String authorName) {
		// List<String> 태그를 "태그1, 태그2" 형태의 문자열로 변환
		String tagsString = (tags != null) ? String.join(",", tags) : "";
		
		return Blog.builder()
				.title(this.title)
				.content(this.content)
				.authorName(authorName) // 작성자는 로그인 정보나 파라미터로 받음
                .thumbnailUrl(null)     // 썸네일 로직은 추후 구현 (일단 null)
                .tags(tagsString)
                .isPaid(this.isPaid != null && this.isPaid)
                .price(this.price != null ? this.price : 0)
                .build();
	}
}
