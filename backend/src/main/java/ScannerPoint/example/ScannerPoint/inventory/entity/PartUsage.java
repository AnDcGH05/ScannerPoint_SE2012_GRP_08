package ScannerPoint.example.ScannerPoint.inventory.entity;

import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * The ternary USES relationship (job card, part, storekeeper). It has a surrogate key
 * because the same part can be issued to the same job more than once.
 * Inserting a row fires trg_part_usage_check (enough stock?) and trg_part_usage_ledger
 * (writes the ISSUE row to the stock ledger, which lowers the stock).
 */
@Entity
@Table(name = "part_usage")
public class PartUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_card_id", nullable = false)
    private JobCard jobCard;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id", nullable = false)
    private SparePart part;

    @Column(nullable = false, columnDefinition = "smallint unsigned")
    private Integer quantity;

    /** The price at the time of issue, so later price changes do not change old bills. */
    @Column(name = "unit_price_at_issue", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceAtIssue;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "issued_by", nullable = false)
    private Employee issuedBy;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    protected PartUsage() {
    }

    public PartUsage(JobCard jobCard, SparePart part, Integer quantity, Employee issuedBy) {
        this.jobCard = jobCard;
        this.part = part;
        this.quantity = quantity;
        this.unitPriceAtIssue = part.getUnitPrice();
        this.issuedBy = issuedBy;
    }

    public Integer getId() { return id; }
    public JobCard getJobCard() { return jobCard; }
    public SparePart getPart() { return part; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getUnitPriceAtIssue() { return unitPriceAtIssue; }
    public Employee getIssuedBy() { return issuedBy; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
}
