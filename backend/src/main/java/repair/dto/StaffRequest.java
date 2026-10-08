package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.EmpRole;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * "Add staff member" drawer (Stitch S5). username and temporaryPassword are only
 * used when creating; specialization and hourlyRate only for mechanics.
 */
public record StaffRequest(
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName,
        @NotNull EmpRole role,
        @NotBlank @Pattern(regexp = "^0[0-9]{9}$", message = "Phone number must be 10 digits starting with 0") String phoneNo,
        @NotNull LocalDate hireDate,
        @NotBlank @Email @Size(max = 100) String email,
        @Size(min = 3, max = 50) String username,
        @Size(min = 8, max = 72, message = "Password must be at least 8 characters") String temporaryPassword,
        @Size(max = 50) String specialization,
        @DecimalMin(value = "0.01", message = "Hourly rate must be more than 0") BigDecimal hourlyRate) {
}
