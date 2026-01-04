package com.devlog.project.manager.model.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.devlog.project.manager.model.dto.ReportManagerDTO;
import com.devlog.project.manager.model.repository.ManagerReportRepository;
import com.devlog.project.report.enums.ReportStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManagerReportServiceImpl implements ManagerReportService {

    private final ManagerReportRepository reportRepository;

    @Override
    public List<ReportManagerDTO> getReportList() {
        return reportRepository.findAllForManager();
    }

	@Override
	public void updateReportStatus(Long reportNo, ReportStatus status) {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException("뿌앙웱");

	}
}
