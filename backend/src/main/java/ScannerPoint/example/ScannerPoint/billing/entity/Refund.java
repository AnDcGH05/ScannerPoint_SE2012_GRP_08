package ScannerPoint.example.ScannerPoint.billing.entity;

import ScannerPoint.example.ScannerPoint.customer.entity.Appointment;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Written by sp_cancel_appointment; the receptionist only marks it as refunded. */
@Entity
@Table(name = "refund")
public class Refund {

    @Id
    @Column(name = "refund_id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @Column(name = "deposit_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal depositPaid;

    @Column(name = "notice_hours", nullable = false)
    private Integer noticeHours;

    @Column(name = "penalty_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal penaltyAmount;

    @Column(name = "refund_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus status = RefundStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private Employee processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "bank_reference", length = 30)
    private String bankReference;

    public void markRefunded(Employee by, String reference) {
        this.status = RefundStatus.REFUNDED;
        this.processedBy = by;
        this.processedAt = LocalDateTime.now();
        this.bankReference = reference;
    }

    public Integer getId() { return id; }
    public Appointment getAppointment() { return appointment; }
    public BigDecimal getDepositPaid() { return depositPaid; }
    public Integer getNoticeHours() { return noticeHours; }
    public BigDecimal getPenaltyAmount() { return penaltyAmount; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public RefundStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Employee getProcessedBy() { return processedBy; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public String getBankReference() { return bankReference; }
}
