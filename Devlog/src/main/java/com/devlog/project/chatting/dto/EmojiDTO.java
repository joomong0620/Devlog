package com.devlog.project.chatting.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class EmojiDTO {
	
	private Long messageNo;
	private String emoji;
	private Long count;
	
	
}
