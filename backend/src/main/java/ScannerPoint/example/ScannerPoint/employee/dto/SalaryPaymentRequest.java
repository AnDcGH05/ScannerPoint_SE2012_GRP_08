package ScannerPoint.example.ScannerPoint.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public class SalaryPaymentRequest {

    @NotBlank(message = "Pay month is required")
    @Pattern(regexp = "^[0-9]{4}-(0[1-9]|1[0-2])$", message = "Pay month must be in YYYY-MM format")
    private String payMonth;

    // Optional: defaults to the employee's monthly salary
    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    private String notes;

    public SalaryPaymentRequest() {}

    public String getPayMonth() { return payMonth; }
    public void setPayMonth(String payMonth) { this.payMonth = payMonth; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
