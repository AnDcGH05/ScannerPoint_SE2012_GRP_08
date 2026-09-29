package ScannerPoint.example.ScannerPoint.inventory.entity;

import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import jakarta.persistence.*;

@Entity
@Table(name = "part_usages")
public class PartUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_card_id", nullable = false)
    private JobCard jobCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @Column(nullable = false)
    private Integer quantityUsed;

    @Column(nullable = false)
    private Double unitPrice;

    public PartUsage() {}

    public PartUsage(JobCard jobCard, SparePart sparePart, Integer quantityUsed, Double unitPrice) {
        this.jobCard = jobCard;
        this.sparePart = sparePart;
        this.quantityUsed = quantityUsed;
        this.unitPrice = unitPrice;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public JobCard getJobCard() { return jobCard; }
    public void setJobCard(JobCard jobCard) { this.jobCard = jobCard; }

    public SparePart getSparePart() { return sparePart; }
    public void setSparePart(SparePart sparePart) { this.sparePart = sparePart; }

    public Integer getQuantityUsed() { return quantityUsed; }
    public void setQuantityUsed(Integer quantityUsed) { this.quantityUsed = quantityUsed; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
}