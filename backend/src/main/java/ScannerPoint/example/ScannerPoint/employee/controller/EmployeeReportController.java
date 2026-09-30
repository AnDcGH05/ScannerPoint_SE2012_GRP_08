package ScannerPoint.example.ScannerPoint.employee.controller;

import ScannerPoint.example.ScannerPoint.employee.dto.EmployeeReportResponse;
import ScannerPoint.example.ScannerPoint.employee.service.EmployeeReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class EmployeeReportController {

    private final EmployeeReportService reportService;

    public EmployeeReportController(EmployeeReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeReportResponse> getEmployeeReport() {
        return ResponseEntity.ok(reportService.generateReport());
    }
}
