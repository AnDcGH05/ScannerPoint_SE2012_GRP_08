package ScannerPoint.example.ScannerPoint.repair.entity;

import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspections")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String details;

    @Column(nullable = false)
    private String resultStatus = "PENDING"; // PASSED, FAILED, NEEDS_ATTENTION

    private LocalDateTime inspectionDate = LocalDateTime.now();

    public Inspection() {}

    public Inspection(Vehicle vehicle, String details, String resultStatus) {
        this.vehicle = vehicle;
        this.details = details;
        this.resultStatus = resultStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getResultStatus() { return resultStatus; }
    public void setResultStatus(String resultStatus) { this.resultStatus = resultStatus; }

    public LocalDateTime getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDateTime inspectionDate) { this.inspectionDate = inspectionDate; }
}