package ScannerPoint.example.ScannerPoint.billing.controller;

import ScannerPoint.example.ScannerPoint.billing.dto.BillingReports.Cancellation;
import ScannerPoint.example.ScannerPoint.billing.dto.BillingReports.OutstandingBill;
import ScannerPoint.example.ScannerPoint.billing.dto.BillingReports.PackagePerformance;
import ScannerPoint.example.ScannerPoint.billing.dto.BillingReports.WeeklyPayments;
import ScannerPoint.example.ScannerPoint.billing.dto.BillingSummaryResponse;
import ScannerPoint.example.ScannerPoint.billing.repository.BillingReportRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.PaymentRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Billing reports for the admin dashboard (queries 4.2, 4.4, 4.5). */
@RestController
@RequestMapping("/api/reports")
public class BillingReportController {

    private final BillingReportRepository reportRepository;
    private final PaymentRepository paymentRepository;

    public BillingReportController(BillingReportRepository reportRepository, PaymentRepository paymentRepository) {
        this.reportRepository = reportRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/outstanding")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Transactional(readOnly = true)
    public List<OutstandingBill> outstanding() {
        return reportRepository.outstanding().stream().map(OutstandingBill::from).toList();
    }

    @GetMapping("/packages")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Transactional(readOnly = true)
    public List<PackagePerformance> packages() {
        return reportRepository.packagePerformance().stream().map(PackagePerformance::from).toList();
    }

    @GetMapping("/cancellations")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Transactional(readOnly = true)
    public List<Cancellation> cancellations() {
        return reportRepository.cancellations().stream().map(Cancellation::from).toList();
    }

    /** ?weeks=8 – verified payments per week. */
    @GetMapping("/payments-weekly")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<WeeklyPayments> paymentsWeekly(@RequestParam(defaultValue = "8") int weeks) {
        return paymentRepository.weeklyVerified(LocalDate.now().minusWeeks(weeks).atStartOfDay()).stream()
                .map(WeeklyPayments::from).toList();
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public BillingSummaryResponse summary() {
        List<OutstandingBill> outstanding = outstanding();
        BigDecimal owed = outstanding.stream().map(OutstandingBill::balanceDue).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new BillingSummaryResponse(reportRepository.totalVerified(), owed, outstanding.size(),
                reportRepository.pendingSlips(), reportRepository.pendingRefunds(), reportRepository.averageRating());
    }
}
