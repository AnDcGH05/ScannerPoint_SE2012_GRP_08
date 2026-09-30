package ScannerPoint.example.ScannerPoint.employee.entity;

import ScannerPoint.example.ScannerPoint.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String nic;

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(nullable = false)
    private String position; // MECHANIC, RECEPTIONIST, STOREKEEPER, MANAGER

    @Column(nullable = false)
    private LocalDate hireDate;

    @Column(nullable = false)
    private Double monthlySalary = 0.0;

    @Column(nullable = false)
    private Boolean active = true;

    // Optional link to the employee's system login account
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    public Employee() {}

    public Employee(String fullName, String nic, String phone, String email, String position,
                    LocalDate hireDate, Double monthlySalary, User user) {
        this.fullName = fullName;
        this.nic = nic;
        this.phone = phone;
        this.email = email;
        this.position = position;
        this.hireDate = hireDate;
        this.monthlySalary = monthlySalary;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }

    public Double getMonthlySalary() { return monthlySalary; }
    public void setMonthlySalary(Double monthlySalary) { this.monthlySalary = monthlySalary; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
