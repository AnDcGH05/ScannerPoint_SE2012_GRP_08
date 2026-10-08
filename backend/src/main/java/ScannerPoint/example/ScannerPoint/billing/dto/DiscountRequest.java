package ScannerPoint.example.ScannerPoint.billing.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** "Apply discount" (and optional tax rate, 0–30%) on a draft bill. */
public record DiscountRequest(
        @NotNull @DecimalMin("0.00") BigDecimal discount,
        @DecimalMin("0.00") @DecimalMax("30.00") BigDecimal taxRate) {
}
