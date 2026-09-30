package ScannerPoint.example.ScannerPoint.employee.dto;

import java.time.LocalDate;

public class SalaryPaymentResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String payMonth;
    private Double amount;
    private LocalDate paymentDate;
    private String notes;

    public SalaryPaymentResponse(Long id, Long employeeId, String employeeName, String payMonth,
                                 Double amount, LocalDate paymentDate, String notes) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.payMonth = payMonth;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public String getEmployeeName() { return employeeName; }
    public String getPayMonth() { return payMonth; }
    public Double getAmount() { return amount; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public String getNotes() { return notes; }
}
