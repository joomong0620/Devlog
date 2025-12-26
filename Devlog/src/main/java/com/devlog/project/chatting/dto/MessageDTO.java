package com.devlog.project.chatting.dto;

import java.time.LocalDateTime;
import java.util.Map;

import com.devlog.project.chatting.chatenums.MsgEnums;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class MessageDTO {
	
	private Long messageNo;
	private Long memberNo;
	private String senderName;
	private String senderProfile;
	
	private String type;
	private String content;
	
	private String imgPath;
	
	private LocalDateTime sendTime;
	
	private String status;
	
	private int unreadCount;
	private boolean mine;
	
	private Map<String, Integer> reactions;
	
	
	public MessageDTO(
		    Long messageNo,
		    Long memberNo,
		    String senderName,
		    String senderProfile,
		    MsgEnums.MsgType type,
		    String content,
		    String imgPath,
		    LocalDateTime sendTime,
		    MsgEnums.MsgStatus status,
		    Long unreadCount,
		    Integer mine
		) {
		    this.messageNo = messageNo;
		    this.memberNo = memberNo;
		    this.senderName = senderName;
		    this.senderProfile = senderProfile;
		    this.type = type.name();               // enum → String
		    this.content = content;
		    this.imgPath = imgPath;
		    this.sendTime = sendTime;
		    this.status = status != null ? status.name() : null;
		    this.unreadCount = unreadCount != null ? unreadCount.intValue() : 0;
		    this.mine = mine != null && mine == 1;
		}
	
	public MessageDTO(Map<String, Integer> reactions) {
		this.reactions = reactions;
	}
	
}
