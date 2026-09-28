package ScannerPoint.example.ScannerPoint.repair.dto;

import java.time.LocalDateTime;

public class RepairResponse {

    private Long id;
    private String cardNumber;
    private String status;
    private Double totalCost;
    private String vehiclePlate;
    private String mechanicName;
    private LocalDateTime createdAt;

    public RepairResponse(Long id, String cardNumber, String status, Double totalCost,
                          String vehiclePlate, String mechanicName, LocalDateTime createdAt) {
        this.id = id;
        this.cardNumber = cardNumber;
        this.status = status;
        this.totalCost = totalCost;
        this.vehiclePlate = vehiclePlate;
        this.mechanicName = mechanicName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getCardNumber() { return cardNumber; }
    public String getStatus() { return status; }
    public Double getTotalCost() { return totalCost; }
    public String getVehiclePlate() { return vehiclePlate; }
    public String getMechanicName() { return mechanicName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}