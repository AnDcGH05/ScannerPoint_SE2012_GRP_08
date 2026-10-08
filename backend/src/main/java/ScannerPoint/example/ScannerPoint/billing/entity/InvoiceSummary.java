package ScannerPoint.example.ScannerPoint.billing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;
import org.hibernate.annotations.Synchronize;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Read-only mapping of the v_invoice_summary VIEW: subtotal, tax, total, the verified
 * deposit, verified final payments and the balance due – derived, never stored.
 * (An invoice with no lines does not appear in the view.)
 */
@Entity
@Immutable
@Subselect("SELECT * FROM v_invoice_summary")
@Synchronize({"invoice", "invoice_item", "payment"})
public class InvoiceSummary {

    @Id
    @Column(name = "invoice_id")
    private Integer invoiceId;

    @Column(name = "invoice_no")
    private String invoiceNo;

    @Column(name = "job_card_id")
    private Integer jobCardId;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    private BigDecimal subtotal;
    private BigDecimal discount;

    @Column(name = "tax_amount")
    private BigDecimal taxAmount;

    private BigDecimal total;

    @Column(name = "deposit_paid")
    private BigDecimal depositPaid;

    @Column(name = "amount_paid")
    private BigDecimal amountPaid;

    @Column(name = "balance_due")
    private BigDecimal balanceDue;

    public Integer getInvoiceId() { return invoiceId; }
    public String getInvoiceNo() { return invoiceNo; }
    public Integer getJobCardId() { return jobCardId; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public InvoiceStatus getStatus() { return status; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getDiscount() { return discount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public BigDecimal getTotal() { return total; }
    public BigDecimal getDepositPaid() { return depositPaid; }
    public BigDecimal getAmountPaid() { return amountPaid; }
    public BigDecimal getBalanceDue() { return balanceDue; }
}
