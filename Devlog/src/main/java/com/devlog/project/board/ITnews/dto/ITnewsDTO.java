package com.devlog.project.board.ITnews.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ITnewsDTO {
	
	private int boardNo;
	private String boardTitle;
	private String boardContent;
	private String bCreateDate;
	private String bUpdateDate;
	private int boardCount;
	private String boardDelFl;
	private int boardCode;
	private int memberNo;
	
	// 뉴스 관련
	private String newsReporter;
	
	// 이미지 관련
	private int imgNo;       
    private String imgPath;  
    private String imgRename;
}
