package ScannerPoint.example.ScannerPoint.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** One supplier's price for a part (part drawer, "Suppliers" tab). */
public record SupplierPartRequest(
        @NotNull Integer supplierId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal unitCost,
        @NotNull @Min(0) @Max(255) Integer leadTimeDays,
        Boolean preferred) {
}
