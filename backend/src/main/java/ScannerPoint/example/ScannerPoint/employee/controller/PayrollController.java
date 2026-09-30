package ScannerPoint.example.ScannerPoint.employee.controller;

import ScannerPoint.example.ScannerPoint.employee.dto.SalaryPaymentRequest;
import ScannerPoint.example.ScannerPoint.employee.dto.SalaryPaymentResponse;
import ScannerPoint.example.ScannerPoint.employee.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary-payments")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @PostMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalaryPaymentResponse> recordPayment(@PathVariable Long employeeId,
                                                               @Valid @RequestBody SalaryPaymentRequest request) {
        return new ResponseEntity<>(payrollService.recordPayment(employeeId, request), HttpStatus.CREATED);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalaryPaymentResponse>> getPaymentsForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPaymentsForEmployee(employeeId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalaryPaymentResponse>> getAllPayments(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(payrollService.getAllPayments(month));
    }
}
