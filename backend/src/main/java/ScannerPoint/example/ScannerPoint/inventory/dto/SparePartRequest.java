package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.entity.PartCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** openingStock is only used when the part is created (written to the ledger as OPENING). */
public record SparePartRequest(
        @NotBlank @Size(max = 20) String partCode,
        @NotBlank @Size(max = 100) String partName,
        @NotNull PartCategory category,
        @NotNull @DecimalMin("0.00") BigDecimal unitPrice,
        @NotNull @Min(0) Integer reorderLevel,
        @Min(0) Integer openingStock) {
}
