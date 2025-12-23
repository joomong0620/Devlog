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
@Table(name = "CHATTING_ROOM")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatRoom {
	
	@Id
	@Column(name = "CHATTING_ROOM_NO")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long chattingRoomNo;
	
	@Column(name = "CHATTING_ROOM_NAME", nullable = false, length = 50)
    private String chattingRoomName;

    @Column(name = "CREATE_DATE", nullable = false)
    private LocalDateTime createDate;

    @Column(name = "ROOM_TYPE", nullable = false, length = 30)
    private String roomType;
    
    
    

    
    
}
