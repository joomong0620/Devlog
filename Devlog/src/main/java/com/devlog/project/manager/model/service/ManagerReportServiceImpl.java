package com.devlog.project.manager.model.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devlog.project.manager.model.dto.ReportManagerDTO;
import com.devlog.project.manager.model.mapper.ManagerReportMapper;
import com.devlog.project.manager.model.repository.ManagerReportRepository;
import com.devlog.project.report.enums.ReportStatus;
import com.devlog.project.report.enums.ReportTargetEnums;
import com.devlog.project.report.model.entity.Report;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManagerReportServiceImpl implements ManagerReportService {

    private final ManagerReportRepository reportRepository;
    private final ManagerReportMapper managerReportMapper;

    @Override
    @Transactional
    public List<ReportManagerDTO> getReportList() {

        // DB에서 신고 목록 조회
        List<ReportManagerDTO> list = reportRepository.findAllForManager();

        list.forEach(dto -> {

            // 게시글 신고인 경우만 처리
            if (dto.getTargetType() == ReportTargetEnums.BOARD) {

                Long boardNo = dto.getTargetId();

                // 게시글 삭제 여부 조회
                int isDeleted = managerReportMapper.isBoardDeleted(boardNo);

                // 게시글 이동 URL 생성
                int boardCode = managerReportMapper.selectBoardCode(boardNo);

                dto.setTargetUrl(
                    resolveBoardUrl(boardCode, boardNo)
                );
            }
        });

        return list;
    }


    @Override
    @Transactional
    public void updateReportStatus(Long reportId, ReportStatus status) {

        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("신고 내역 없음"));

        if (report.getStatus() != ReportStatus.PENDING) {
            return;
        }

        if (report.getTargetType() == ReportTargetEnums.BOARD
            && status == ReportStatus.RESOLVED) {

            Long boardNo = report.getTargetId();
            managerReportMapper.deleteBoard(boardNo);
        }

        report.setStatus(status);
        report.setProcessedAt(LocalDateTime.now());
        
        reportRepository.save(report);
        reportRepository.flush();
    }

    /**
     * 게시판 코드에서 게시글 URL 변환
     * 알림 서비스와 동일한 방식으로 진행함
     */
    private String resolveBoardUrl(int boardCode, Long boardNo) {
        return switch (boardCode) {
            case 1 -> "/blog/" + boardNo;
            case 21, 22, 23, 24, 25, 26 -> "/ITnews/" + boardNo;
            case 3 -> "/board/freeboard/" + boardNo;
            default -> throw new IllegalArgumentException(
                "Invalid boardCode: " + boardCode
            );
        };
    }

    
    @Transactional
    public void syncResolvedReports() {

        List<Report> reports = reportRepository.findPendingBoardReports();

        for (Report report : reports) {
            Long boardNo = report.getTargetId();

            int isDeleted = managerReportMapper.isBoardDeleted(boardNo);

            if (isDeleted == 1) {
                report.setStatus(ReportStatus.RESOLVED);
                report.setProcessedAt(LocalDateTime.now());
            }
        }
    }
}

