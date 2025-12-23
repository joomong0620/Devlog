package com.devlog.project.chatting.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "MESSAGE")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Message {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Oracle 12c+
    @Column(name = "MESSAGE_NO")
    private Long messageNo;

    @Column(name = "CHATTING_ROOM_NO", nullable = false)
    private Long chattingRoomNo;

    @Column(name = "MEMBER_NO", nullable = false)
    private Long memberNo;

    @Column(name = "SEND_TIME", nullable = false)
    private LocalDateTime sendTime;

    @Column(name = "TYPE", nullable = false, length = 20)
    private String type; // IMG / SYSTEM / TEXT

    @Column(name = "MESSAGE_CONTENT", length = 3000)
    private String messageContent;

    @Column(name = "MESSAGE_STATUS", length = 30)
    private String messageStatus; // 수정 / 삭제

}
