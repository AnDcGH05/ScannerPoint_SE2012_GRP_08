package ScannerPoint.example.ScannerPoint.repair.dto;

import java.time.LocalDateTime;

public class AppointmentResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private Long vehicleId;
    private String licensePlate;
    private LocalDateTime appointmentDate;
    private String serviceType;
    private String status;
    private String notes;

    public AppointmentResponse(Long id, Long customerId, String customerName, Long vehicleId,
                               String licensePlate, LocalDateTime appointmentDate, String serviceType,
                               String status, String notes) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.vehicleId = vehicleId;
        this.licensePlate = licensePlate;
        this.appointmentDate = appointmentDate;
        this.serviceType = serviceType;
        this.status = status;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public Long getVehicleId() { return vehicleId; }
    public String getLicensePlate() { return licensePlate; }
    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public String getServiceType() { return serviceType; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
}