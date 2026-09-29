package ScannerPoint.example.ScannerPoint.billing.dto;

import java.time.LocalDateTime;

public class PaymentResponse {
    private Long id;
    private Long invoiceId;
    private Double amount;
    private String paymentMethod;
    private LocalDateTime paymentDate;

    public PaymentResponse(Long id, Long invoiceId, Double amount, String paymentMethod, LocalDateTime paymentDate) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.paymentDate = paymentDate;
    }

    public Long getId() { return id; }
    public Long getInvoiceId() { return invoiceId; }
    public Double getAmount() { return amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
}