package ScannerPoint.example.ScannerPoint.billing.service;

import ScannerPoint.example.ScannerPoint.billing.dto.ReportResponse;
import ScannerPoint.example.ScannerPoint.billing.repository.InvoiceRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public ReportService(InvoiceRepository invoiceRepository, PaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    public ReportResponse generateSummaryReport() {
        Double totalRevenue = paymentRepository.calculateTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0.0;

        long totalInvoices = invoiceRepository.count();
        long pendingInvoices = invoiceRepository.countByStatus("PENDING") + invoiceRepository.countByStatus("PARTIAL");

        return new ReportResponse(totalRevenue, totalInvoices, pendingInvoices);
    }
}
