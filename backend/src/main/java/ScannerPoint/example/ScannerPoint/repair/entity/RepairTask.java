package ScannerPoint.example.ScannerPoint.repair.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "repair_tasks")
public class RepairTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String taskName;

    private String description;

    @Column(nullable = false)
    private Double cost = 0.0;

    private Boolean isCompleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_card_id", nullable = false)
    private JobCard jobCard;

    public RepairTask() {}

    public RepairTask(String taskName, String description, Double cost, JobCard jobCard) {
        this.taskName = taskName;
        this.description = description;
        this.cost = cost;
        this.jobCard = jobCard;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public JobCard getJobCard() { return jobCard; }
    public void setJobCard(JobCard jobCard) { this.jobCard = jobCard; }
}