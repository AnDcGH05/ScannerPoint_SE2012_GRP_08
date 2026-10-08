package ScannerPoint.example.ScannerPoint.repair.controller;

import ScannerPoint.example.ScannerPoint.repair.dto.MechanicWorkloadResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.StageTimeResponse;
import ScannerPoint.example.ScannerPoint.repair.repository.JobCardRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Workshop reports for the admin dashboard (queries 2.1 and 2.5). */
@RestController
@RequestMapping("/api/reports")
public class RepairReportController {

    private final JobCardRepository jobCardRepository;

    public RepairReportController(JobCardRepository jobCardRepository) {
        this.jobCardRepository = jobCardRepository;
    }

    @GetMapping("/mechanic-workload")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Transactional(readOnly = true)
    public List<MechanicWorkloadResponse> mechanicWorkload() {
        return jobCardRepository.mechanicWorkload().stream().map(MechanicWorkloadResponse::from).toList();
    }

    @GetMapping("/stage-times")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<StageTimeResponse> stageTimes() {
        return jobCardRepository.averageStageTimes().stream().map(StageTimeResponse::from).toList();
    }
}
