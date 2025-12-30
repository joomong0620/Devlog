package com.devlog.project.board.blog.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.type.YesNoConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 무분별한 객체 생성 방지
@Entity
@Table(name = "BOARD")
public class Blog {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "board_seq_gen")
	@SequenceGenerator(
			name = "board_seq_gen", 
			sequenceName = "SEQ_BOARD_NO", // DB 시퀀스 이름이랑 일치
			allocationSize = 1 // 1씩 증가
			)
	@Column(name = "BOARD_NO")
	// PK 값 자동 생성
	private Long id;
	
	@Column(name = "BOARD_CODE", nullable = false)
	private int boardCode; 
	
	@Column(name = "MEMBER_NO", nullable = false)
	private Long memberNo;

	@Column(name = "BOARD_TITLE", nullable = false, length = 300)
	private String title;

	@Lob
	@Column(name = "BOARD_CONTENT", columnDefinition = "CLOB", nullable = false)
	private String content;

	@Column(nullable = false, length = 50)
	private String authorName;

	private String thumbnailUrl;
	
	@Column(name = "TAGS")
	private String tags; // 태그

	@Convert(converter = YesNoConverter.class)
	@Column(name = "IS_PAID", nullable = false)
	@ColumnDefault("'N'")
	private boolean isPaid; // 유료 콘텐츠 여부

	@ColumnDefault("0")
	private int price; // 가격

	@Convert(converter = YesNoConverter.class)
	@Column(name = "TEMP_FL", nullable = false)
	@ColumnDefault("'Y'")
	private boolean tempFl;

	// 초기값 0 설정
	@ColumnDefault("0")
	private int viewCount; // 조회수

	@ColumnDefault("0")
	private int commentCount; // 댓글수

	@ColumnDefault("0")
	private int likeCount; // 좋아요수

	@CreationTimestamp // INSERT 시 시간 자동 저장
	@Column(name = "B_CREATE_DATE", updatable = false)
	private LocalDateTime createdDate;

	// 빌더 패턴 적용
	@Builder
	public Blog(String title, String content, String authorName, Long memberNo, int boardCode, String thumbnailUrl, String tags, boolean isPaid,
			int price, boolean tempFl) {
		this.title = title;
		this.content = content;
		this.authorName = authorName;
		this.memberNo = memberNo;
		this.boardCode = boardCode;
		this.thumbnailUrl = thumbnailUrl;
		this.tags = tags;
		this.isPaid = isPaid;
		this.price = price;
		this.tempFl = tempFl; // 여기서 값을 받아야 DB에 Y/N이 정확히 들어감
		this.viewCount = 0;
		this.commentCount = 0;
		this.likeCount = 0;
	}

}
