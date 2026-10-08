package ScannerPoint.example.ScannerPoint.inventory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SupplierRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 80) String contactPerson,
        @NotBlank @Pattern(regexp = "^0[0-9]{9}$", message = "Phone number must be 10 digits starting with 0") String phoneNo,
        @Email @Size(max = 100) String email,
        @NotBlank @Size(max = 50) String city) {
}
