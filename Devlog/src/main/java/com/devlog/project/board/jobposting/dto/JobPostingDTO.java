package com.devlog.project.board.jobposting.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class JobPostingDTO {
	
	private Long postingNo;
	private String postingTitle;
	private String postingContent;
	private String recField;
	private String recCount;
	private String empType;
	private String salary;
	private String reqCareer;
	private String reqEducation;
	private String applyStrart;
	private String applyEnd;
	private String applyMethod;
	private Long companyCode;

}
