package ScannerPoint.example.ScannerPoint.repair.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/** Read only: rows are written by the job card triggers, never by Java. */
@Entity
@Immutable
@Table(name = "job_status_history")
public class JobStatusHistory {

    @Id
    @Column(name = "history_id")
    private Integer id;

    @Column(name = "job_card_id", nullable = false)
    private Integer jobCardId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private Employee changedBy;

    protected JobStatusHistory() {
    }

    public Integer getId() { return id; }
    public Integer getJobCardId() { return jobCardId; }
    public JobStatus getStatus() { return status; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public Employee getChangedBy() { return changedBy; }
}
