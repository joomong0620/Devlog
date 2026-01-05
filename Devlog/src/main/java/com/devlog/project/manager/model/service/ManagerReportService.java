package com.devlog.project.manager.model.service;

import java.util.List;

import com.devlog.project.manager.model.dto.ReportManagerDTO;
import com.devlog.project.report.enums.ReportStatus;

public interface ManagerReportService {

    List<ReportManagerDTO> getReportList();

    void updateReportStatus(Long reportId, ReportStatus status);
    
    // 처리 상태 변경하기
    void syncResolvedReports();
}