package ScannerPoint.example.ScannerPoint.billing.dto;

import ScannerPoint.example.ScannerPoint.billing.entity.ItemType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Receptionist's "Add line" on a draft bill. */
public record InvoiceLineRequest(
        @NotNull ItemType itemType,
        @NotBlank @Size(max = 150) String description,
        @NotNull @DecimalMin(value = "0.01") @DecimalMax("9999.99") BigDecimal quantity,
        @NotNull @DecimalMin("0.00") BigDecimal unitPrice) {
}
