package com.devlog.project.manager.model.dto;

import java.time.LocalDateTime;

import com.devlog.project.report.enums.ReportStatus;
import com.devlog.project.report.enums.ReportTargetEnums;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReportManagerDTO {

    private Long reportNo;
    private String reportType;
    private ReportTargetEnums targetType;
    private String reportReason;

    private String reporterNickname;
    private String targetNickname;

    private LocalDateTime reportDate;
    private LocalDateTime processDate;

    private ReportStatus status;

    public ReportManagerDTO(
            Long reportNo,
            String reportType,
            ReportTargetEnums targetType,
            String reportReason,
            String reporterNickname,
            String targetNickname,
            LocalDateTime reportDate,
            LocalDateTime processDate,
            ReportStatus status
    ) {
        this.reportNo = reportNo;
        this.reportType = reportType;
        this.targetType = targetType;
        this.reportReason = reportReason;
        this.reporterNickname = reporterNickname;
        this.targetNickname = targetNickname;
        this.reportDate = reportDate;
        this.processDate = processDate;
        this.status = status;
    }
}
