package ScannerPoint.example.ScannerPoint.billing.dto;

import java.time.LocalDateTime;

public class InvoiceResponse {
    private Long id;
    private Long customerId;
    private Long jobCardId;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;

    public InvoiceResponse(Long id, Long customerId, Long jobCardId, Double totalAmount, String status, LocalDateTime createdAt) {
        this.id = id;
        this.customerId = customerId;
        this.jobCardId = jobCardId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public Long getJobCardId() { return jobCardId; }
    public Double getTotalAmount() { return totalAmount; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}