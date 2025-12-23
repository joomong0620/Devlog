package com.devlog.project.chatting.dto;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class ChattingListDTO {

    private Long chattingRoomNo;
    private String roomType;
    private String pinnedYn;
    private String displayName;
    private String roomImg;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Long unreadCount;

    public ChattingListDTO(
    	Object  chattingRoomNo,
        String roomType,
        String pinnedYn,
        String displayName,
        String roomImg,
        String lastMessage,
        Object  lastMessageAt,
        Object  unreadCount
    ) {
        this.chattingRoomNo = chattingRoomNo != null ? ((Number) chattingRoomNo).longValue() : null;;
        this.roomType = roomType;
        this.pinnedYn = pinnedYn;
        this.displayName = displayName;
        this.roomImg = roomImg;
        this.lastMessage = lastMessage;
        if (lastMessageAt instanceof java.sql.Timestamp) {
            this.lastMessageAt = ((java.sql.Timestamp) lastMessageAt).toLocalDateTime();
        }
        this.unreadCount = unreadCount != null ? ((Number) unreadCount).longValue() : null;
    }
}

