package ScannerPoint.example.ScannerPoint.user.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Enter your username or e-mail") String usernameOrEmail,
        @NotBlank(message = "Enter your password") String password) {
}
