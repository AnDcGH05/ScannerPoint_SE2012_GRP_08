package ScannerPoint.example.ScannerPoint.repair.dto;

public class JobCardResponse {

    private Long id;
    private String cardNumber;
    private String status;
    private Double totalCost;
    private Long vehicleId;
    private String licensePlate;
    private Long mechanicId;
    private String mechanicName;

    public JobCardResponse(Long id, String cardNumber, String status, Double totalCost,
                           Long vehicleId, String licensePlate, Long mechanicId, String mechanicName) {
        this.id = id;
        this.cardNumber = cardNumber;
        this.status = status;
        this.totalCost = totalCost;
        this.vehicleId = vehicleId;
        this.licensePlate = licensePlate;
        this.mechanicId = mechanicId;
        this.mechanicName = mechanicName;
    }

    public Long getId() { return id; }
    public String getCardNumber() { return cardNumber; }
    public String getStatus() { return status; }
    public Double getTotalCost() { return totalCost; }
    public Long getVehicleId() { return vehicleId; }
    public String getLicensePlate() { return licensePlate; }
    public Long getMechanicId() { return mechanicId; }
    public String getMechanicName() { return mechanicName; }
}