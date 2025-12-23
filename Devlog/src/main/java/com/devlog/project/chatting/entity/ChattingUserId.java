package com.devlog.project.chatting.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ChattingUserId implements Serializable {
	
	
	
	@Column(name = "CHATTING_ROOM_NO")
	private Long roomNo;
	
	@Column(name = "MEMBER_NO")
	private int memberNo;
	
	
}
