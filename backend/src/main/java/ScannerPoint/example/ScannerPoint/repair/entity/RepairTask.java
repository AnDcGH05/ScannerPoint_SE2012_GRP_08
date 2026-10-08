package ScannerPoint.example.ScannerPoint.repair.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * Work done on a job. Package work is not additional; extra work found during diagnosis
 * is additional and needs the customer's approval (chk_task_approval).
 */
@Entity
@Table(name = "repair_task")
@IdClass(RepairTaskId.class)
public class RepairTask {

    @Id
    @Column(name = "job_card_id")
    private Integer jobCardId;

    @Id
    @Column(name = "task_no", columnDefinition = "tinyint unsigned")
    private Integer taskNo;

    @Column(nullable = false, length = 150)
    private String description;

    @Column(name = "labour_hours", nullable = false, precision = 4, scale = 1)
    private BigDecimal labourHours;

    @Column(name = "is_additional", nullable = false)
    private Boolean additional = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.NOT_REQUIRED;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_status", nullable = false)
    private TaskStatus taskStatus = TaskStatus.PENDING;

    protected RepairTask() {
    }

    public RepairTask(Integer jobCardId, Integer taskNo, String description, BigDecimal labourHours, boolean additional) {
        this.jobCardId = jobCardId;
        this.taskNo = taskNo;
        this.description = description;
        this.labourHours = labourHours;
        this.additional = additional;
        this.approvalStatus = additional ? ApprovalStatus.PENDING : ApprovalStatus.NOT_REQUIRED;
    }

    public Integer getJobCardId() { return jobCardId; }
    public Integer getTaskNo() { return taskNo; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getLabourHours() { return labourHours; }
    public void setLabourHours(BigDecimal labourHours) { this.labourHours = labourHours; }
    public Boolean getAdditional() { return additional; }
    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
    public TaskStatus getTaskStatus() { return taskStatus; }
    public void setTaskStatus(TaskStatus taskStatus) { this.taskStatus = taskStatus; }
}
