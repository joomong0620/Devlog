package com.devlog.project.board.blog.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 무분별한 객체 생성 방지
@Entity
@Table(name = "BLOG")
public class Blog {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	// PK 값 자동 생성
	private Long id;
	
	@Column(nullable = false, length = 200)
	private String title;
	
	@Lob
	@Column(columnDefinition = "CLOB", nullable = false)
	private String content;
	
	@Column(nullable = false, length = 50)
	private String authorName;
	
	private String thumbnailUrl;
	
	// 초기값 0 설정
	@ColumnDefault("0")
	private int viewCount; // 조회수
	
	@ColumnDefault("0")
	private int commentCount; // 댓글수
	
	@ColumnDefault("0")
	private int likeCount; // 좋아요수
	
	@CreationTimestamp // INSERT 시 시간 자동 저장
	@Column(updatable = false)
	private LocalDateTime createdDate;
	
	// 빌더 패턴 적용
	public Blog(String title, String content, String authorName, String thumbnailUrl) {
        this.title = title;
        this.content = content;
        this.authorName = authorName;
        this.thumbnailUrl = thumbnailUrl;
        // 숫자 필드 초기화
        this.viewCount = 0;
        this.commentCount = 0;
        this.likeCount = 0;
    }
	
	
	
	
	
	
	
	
	
}
