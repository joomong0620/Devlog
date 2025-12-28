package com.devlog.project.board.ITnews.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class Comment {
	private int commentNo;
	private int memberNo;
	private int boardNo;
	private int parentCommentNo;
	private String commentCreateDate;
	private String commentContent;
	private String commentDeleteFlag;
	private String secretYN;
	private String modifyYN;
	private String memberNickname;
	private String profileImg;
	
	
	private int likeCount;    
    private int badCount;     
    private int likeCheck;    
    private int badCheck;     

}
