package ScannerPoint.example.ScannerPoint.repair.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/** 1:1 weak entity of JOB_CARD: shares the job card's primary key (@MapsId). */
@Entity
@Table(name = "inspection")
public class Inspection {

    @Id
    @Column(name = "job_card_id")
    private Integer jobCardId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_card_id")
    private JobCard jobCard;

    @Column(name = "inspected_at", nullable = false)
    private LocalDateTime inspectedAt;

    @Column(nullable = false, length = 255)
    private String findings;

    @Column(length = 255)
    private String diagnosis;

    @Column(name = "recommended_action", length = 255)
    private String recommendedAction;

    protected Inspection() {
    }

    public Inspection(JobCard jobCard) {
        this.jobCard = jobCard;
    }

    public Integer getJobCardId() { return jobCardId; }
    public JobCard getJobCard() { return jobCard; }
    public LocalDateTime getInspectedAt() { return inspectedAt; }
    public void setInspectedAt(LocalDateTime inspectedAt) { this.inspectedAt = inspectedAt; }
    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
}
