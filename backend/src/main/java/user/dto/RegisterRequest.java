package user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** The "Create account" tab of the login page (Stitch screen A1). */
public record RegisterRequest(
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName,
        @NotBlank @Pattern(regexp = "^([0-9]{9}[VvXx]|[0-9]{12})$", message = "NIC must be 9 digits + V/X or 12 digits") String nic,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Pattern(regexp = "^0[0-9]{9}$", message = "Mobile number must be 10 digits starting with 0") String mobile,
        @NotBlank @Size(max = 100) String street,
        @NotBlank @Size(max = 50) String city,
        @Pattern(regexp = "^([0-9]{5})?$", message = "Postal code must be 5 digits") String postalCode,
        @NotBlank @Size(min = 3, max = 50) @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Use letters, numbers, dots, dashes or underscores") String username,
        @NotBlank @Size(min = 8, max = 72, message = "Password must be at least 8 characters") String password,
        String confirmPassword) {
}
