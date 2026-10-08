package ScannerPoint.example.ScannerPoint.inventory.entity;

import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
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

import java.time.LocalDateTime;

/** A mechanic asks the storekeeper for a part for one job card. */
@Entity
@Table(name = "part_request")
public class PartRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_card_id", nullable = false)
    private JobCard jobCard;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id", nullable = false)
    private SparePart part;

    @Column(nullable = false, columnDefinition = "smallint unsigned")
    private Integer quantity;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartRequestStatus status = PartRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by")
    private Employee handledBy;

    @Column(name = "handled_at")
    private LocalDateTime handledAt;

    @Column(name = "reject_reason", length = 150)
    private String rejectReason;

    /** Records who handled the request (chk_req_handled needs both values). */
    public void handle(PartRequestStatus newStatus, Employee by) {
        this.status = newStatus;
        this.handledBy = by;
        this.handledAt = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public JobCard getJobCard() { return jobCard; }
    public void setJobCard(JobCard jobCard) { this.jobCard = jobCard; }
    public SparePart getPart() { return part; }
    public void setPart(SparePart part) { this.part = part; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public PartRequestStatus getStatus() { return status; }
    public Employee getHandledBy() { return handledBy; }
    public LocalDateTime getHandledAt() { return handledAt; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
}
