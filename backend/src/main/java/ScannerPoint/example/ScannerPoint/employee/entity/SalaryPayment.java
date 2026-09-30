package ScannerPoint.example.ScannerPoint.employee.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "salary_payments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "pay_month"}))
public class SalaryPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "pay_month", nullable = false)
    private String payMonth; // e.g. 2026-09

    @Column(nullable = false)
    private Double amount;

    private LocalDate paymentDate = LocalDate.now();

    private String notes;

    public SalaryPayment() {}

    public SalaryPayment(Employee employee, String payMonth, Double amount, String notes) {
        this.employee = employee;
        this.payMonth = payMonth;
        this.amount = amount;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getPayMonth() { return payMonth; }
    public void setPayMonth(String payMonth) { this.payMonth = payMonth; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
