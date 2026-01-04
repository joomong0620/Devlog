package com.devlog.project.manager.model.service;

import java.util.List;

import com.devlog.project.manager.model.dto.ReportManagerDTO;
import com.devlog.project.report.enums.ReportStatus;

public interface ManagerReportService {

    List<ReportManagerDTO> getReportList();

    void updateReportStatus(Long reportNo, ReportStatus status);
}