package com.devlog.project.manager.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.devlog.project.manager.model.dto.ReportManagerDTO;
import com.devlog.project.report.model.entity.Report;

public interface ManagerReportRepository extends JpaRepository<Report, Long> {

    @Query("""
        select new com.devlog.project.manager.model.dto.ReportManagerDTO(
            r.reportId,
            rc.reportType,
            r.targetType,
            r.content,
            reporter.memberNickname,
            reported.memberNickname,
            r.createdAt,
            r.processedAt,
            r.status
        )
        from Report r
        join r.reportCode rc
        join r.reporter reporter
        join r.reported reported
        order by r.createdAt desc
    """)
    List<ReportManagerDTO> findAllForManager();
}
