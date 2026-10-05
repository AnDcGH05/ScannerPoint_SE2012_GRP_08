package ScannerPoint.example.ScannerPoint.billing.service;

import ScannerPoint.example.ScannerPoint.billing.dto.PaymentRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.PaymentResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.Invoice;
import ScannerPoint.example.ScannerPoint.billing.entity.Payment;
import ScannerPoint.example.ScannerPoint.billing.repository.InvoiceRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentService(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new NotFoundException("Invoice not found"));

        Payment payment = new Payment(invoice, request.getAmount(), request.getPaymentMethod());
        Payment saved = paymentRepository.save(payment);

        List<Payment> existingPayments = paymentRepository.findByInvoiceId(invoice.getId());
        double totalPaid = existingPayments.stream().mapToDouble(Payment::getAmount).sum();

        if (totalPaid >= invoice.getTotalAmount()) {
            invoice.setStatus("PAID");
        } else {
            invoice.setStatus("PARTIAL");
        }
        invoiceRepository.save(invoice);

        return new PaymentResponse(
                saved.getId(),
                saved.getInvoice().getId(),
                saved.getAmount(),
                saved.getPaymentMethod(),
                saved.getPaymentDate()
        );
    }
}
