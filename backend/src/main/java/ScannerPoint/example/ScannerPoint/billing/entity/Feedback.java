package ScannerPoint.example.ScannerPoint.billing.entity;

import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/** 1:1 weak entity of JOB_CARD: one rating per collected job (shares the job card's key). */
@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @Column(name = "job_card_id")
    private Integer jobCardId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_card_id")
    private JobCard jobCard;

    @Column(nullable = false, columnDefinition = "tinyint unsigned")
    private Integer rating;

    @Column(length = 255)
    private String comments;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    protected Feedback() {
    }

    public Feedback(JobCard jobCard) {
        this.jobCard = jobCard;
    }

    public Integer getJobCardId() { return jobCardId; }
    public JobCard getJobCard() { return jobCard; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
