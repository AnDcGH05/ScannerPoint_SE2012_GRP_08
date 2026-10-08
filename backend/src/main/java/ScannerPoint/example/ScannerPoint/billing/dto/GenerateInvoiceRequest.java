package ScannerPoint.example.ScannerPoint.billing.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** "Bill" button on a Ready job card. warrantyMonths is optional (e.g. 3 or 6). */
public record GenerateInvoiceRequest(
        @NotNull Integer jobCardId,
        @Min(0) @Max(60) Integer warrantyMonths) {
}
