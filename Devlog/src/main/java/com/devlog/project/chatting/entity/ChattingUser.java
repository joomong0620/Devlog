package com.devlog.project.chatting.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "CHATTING_USER")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder public class ChattingUser {
	
	
	@EmbeddedId
	private ChattingUserId chatUserId;
	
	@Column(name = "PINNED_YN", length = 1)
	private String pinnedYn;
	
	
	@Column(name = "JOIN_DATE", nullable = false)
	private LocalDateTime joinDate;
	
	@Column(name = "ROLE", length = 30, nullable = false)
	private String role;
	
	@Column(name="LAST_READ_NO", nullable = true)
	private Integer lastReadNo;
	
	
	
	@PrePersist
	public void prePersist() {
		this.joinDate = LocalDateTime.now();
		
		this.pinnedYn = "N";
	}
	
	
	



}

