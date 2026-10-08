package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.EmpRole;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StaffResponse(
        Integer id,
        String firstName,
        String lastName,
        String fullName,
        EmpRole role,
        String phoneNo,
        String email,
        String username,
        LocalDate hireDate,
        String specialization,
        BigDecimal hourlyRate,
        boolean active) {

    public static StaffResponse from(Employee e) {
        return new StaffResponse(e.getId(), e.getFirstName(), e.getLastName(), e.getFullName(), e.getEmpRole(),
                e.getPhoneNo(), e.getEmail(), e.getUsername(), e.getHireDate(), e.getSpecialization(),
                e.getHourlyRate(), Boolean.TRUE.equals(e.getActive()));
    }
}
