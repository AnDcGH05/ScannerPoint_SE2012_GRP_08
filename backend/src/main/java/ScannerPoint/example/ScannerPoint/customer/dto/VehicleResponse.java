package ScannerPoint.example.ScannerPoint.customer.dto;

public class VehicleResponse {
    private Long id;
    private String licensePlate;
    private String make;
    private String model;
    private Long customerId;
    private String customerName;

    public VehicleResponse(Long id, String licensePlate, String make, String model, Long customerId, String customerName) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.make = make;
        this.model = model;
        this.customerId = customerId;
        this.customerName = customerName;
    }

    public Long getId() { return id; }
    public String getLicensePlate() { return licensePlate; }
    public String getMake() { return make; }
    public String getModel() { return model; }
    public Long getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
}