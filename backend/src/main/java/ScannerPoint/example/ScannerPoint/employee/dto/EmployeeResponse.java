package ScannerPoint.example.ScannerPoint.employee.dto;

import java.time.LocalDate;

public class EmployeeResponse {

    private Long id;
    private String fullName;
    private String nic;
    private String phone;
    private String email;
    private String position;
    private LocalDate hireDate;
    private Double monthlySalary;
    private Boolean active;
    private Long userId;
    private String username;

    public EmployeeResponse(Long id, String fullName, String nic, String phone, String email,
                            String position, LocalDate hireDate, Double monthlySalary,
                            Boolean active, Long userId, String username) {
        this.id = id;
        this.fullName = fullName;
        this.nic = nic;
        this.phone = phone;
        this.email = email;
        this.position = position;
        this.hireDate = hireDate;
        this.monthlySalary = monthlySalary;
        this.active = active;
        this.userId = userId;
        this.username = username;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getNic() { return nic; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getPosition() { return position; }
    public LocalDate getHireDate() { return hireDate; }
    public Double getMonthlySalary() { return monthlySalary; }
    public Boolean getActive() { return active; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
}
