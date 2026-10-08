package ScannerPoint.example.ScannerPoint.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** "Mark refunded" asks for the bank transfer reference. */
public record RefundRequest(@NotBlank @Size(max = 30) String bankReference) {
}
