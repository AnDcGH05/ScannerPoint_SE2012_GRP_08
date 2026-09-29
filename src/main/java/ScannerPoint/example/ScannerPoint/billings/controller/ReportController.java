package ScannerPoint.example.ScannerPoint.billing.controller;

import ScannerPoint.example.ScannerPoint.billing.dto.ReportResponse;
import ScannerPoint.example.ScannerPoint.billing.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> getSummaryReport() {
        return ResponseEntity.ok(reportService.generateSummaryReport());
    }
}