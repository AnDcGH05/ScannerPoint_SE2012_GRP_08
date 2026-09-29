package ScannerPoint.example.ScannerPoint.repair.dto;

import jakarta.validation.constraints.NotNull;

public class RepairRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private Long mechanicId;
    private String description;
    private String status;
    private Double estimatedCost;

    public RepairRequest() {}

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Long getMechanicId() { return mechanicId; }
    public void setMechanicId(Long mechanicId) { this.mechanicId = mechanicId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }
}