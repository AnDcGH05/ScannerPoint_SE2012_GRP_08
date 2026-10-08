package ScannerPoint.example.ScannerPoint.customer.dto;

import ScannerPoint.example.ScannerPoint.customer.entity.CustomerPhone;
import ScannerPoint.example.ScannerPoint.customer.entity.PhoneType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PhoneDto(
        @NotBlank @Pattern(regexp = "^0[0-9]{9}$", message = "Phone number must be 10 digits starting with 0") String phoneNo,
        PhoneType phoneType) {

    public static PhoneDto from(CustomerPhone p) {
        return new PhoneDto(p.getPhoneNo(), p.getPhoneType());
    }
}
