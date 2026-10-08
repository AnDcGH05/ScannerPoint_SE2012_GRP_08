package ScannerPoint.example.ScannerPoint.customer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** "Register walk-in customer" (Stitch A6): customer details plus, optionally, the first vehicle. */
public record WalkInRequest(
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName,
        @NotBlank @Pattern(regexp = "^([0-9]{9}[VvXx]|[0-9]{12})$", message = "NIC must be 9 digits + V/X or 12 digits") String nic,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Pattern(regexp = "^0[0-9]{9}$", message = "Mobile number must be 10 digits starting with 0") String mobile,
        @NotBlank @Size(max = 100) String street,
        @NotBlank @Size(max = 50) String city,
        @Pattern(regexp = "^([0-9]{5})?$", message = "Postal code must be 5 digits") String postalCode,
        @Valid VehicleRequest vehicle) {
}
