package ScannerPoint.example.ScannerPoint.billing.entity;

import ScannerPoint.example.ScannerPoint.customer.entity.Appointment;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A bank-transfer slip uploaded by the customer. A DEPOSIT points at a booking, a FINAL
 * payment at a bill (chk_payment_target). The receptionist verifies or rejects it.
 */
@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "slip_file", nullable = false, length = 255)
    private String slipFile;

    @Column(name = "bank_reference", length = 30)
    private String bankReference;

    /** The date printed on the bank slip. */
    @Column(name = "paid_on", nullable = false)
    private LocalDate paidOn;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private Employee verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "reject_reason", length = 150)
    private String rejectReason;

    /** Verified or rejected: chk_payment_verified needs who and when. */
    public void decide(PaymentStatus newStatus, Employee by, String reason) {
        this.status = newStatus;
        this.verifiedBy = by;
        this.verifiedAt = LocalDateTime.now();
        this.rejectReason = reason;
    }

    public Integer getId() { return id; }
    public PaymentType getPaymentType() { return paymentType; }
    public void setPaymentType(PaymentType paymentType) { this.paymentType = paymentType; }
    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }
    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getSlipFile() { return slipFile; }
    public void setSlipFile(String slipFile) { this.slipFile = slipFile; }
    public String getBankReference() { return bankReference; }
    public void setBankReference(String bankReference) { this.bankReference = bankReference; }
    public LocalDate getPaidOn() { return paidOn; }
    public void setPaidOn(LocalDate paidOn) { this.paidOn = paidOn; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public PaymentStatus getStatus() { return status; }
    public Employee getVerifiedBy() { return verifiedBy; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public String getRejectReason() { return rejectReason; }
}
