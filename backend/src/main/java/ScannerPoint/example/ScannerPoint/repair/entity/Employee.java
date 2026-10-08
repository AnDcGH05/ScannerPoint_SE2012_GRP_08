package ScannerPoint.example.ScannerPoint.repair.entity;

import ScannerPoint.example.ScannerPoint.user.entity.Role;
import ScannerPoint.example.ScannerPoint.user.entity.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * EMPLOYEE – subclass of USER_ACCOUNT (employee_id = user_id).
 * specialization and hourly_rate exist only for mechanics (chk_employee_mechanic).
 */
@Entity
@Table(name = "employee")
@DiscriminatorValue("EMPLOYEE")
@PrimaryKeyJoinColumn(name = "employee_id")
public class Employee extends UserAccount {

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "emp_role", nullable = false)
    private EmpRole empRole;

    @Column(name = "phone_no", nullable = false, length = 10)
    private String phoneNo;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(length = 50)
    private String specialization;

    @Column(name = "hourly_rate", precision = 8, scale = 2)
    private BigDecimal hourlyRate;

    @Override
    public Role getRole() {
        return empRole.toRole();
    }

    @Override
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isMechanic() {
        return empRole == EmpRole.MECHANIC;
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public EmpRole getEmpRole() { return empRole; }
    public void setEmpRole(EmpRole empRole) { this.empRole = empRole; }
    public String getPhoneNo() { return phoneNo; }
    public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
}
