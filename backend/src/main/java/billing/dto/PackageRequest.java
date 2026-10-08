package billing.dto;

import billing.entity.PricingType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Admin "Service packages" card (Stitch W6). */
public record PackageRequest(
        @NotBlank @Size(max = 60) String name,
        @NotBlank @Size(max = 255) String includesWork,
        @NotNull PricingType pricingType,
        @NotNull @DecimalMin(value = "0.01") BigDecimal basePrice,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal depositPercent,
        @NotNull @DecimalMin(value = "0.01") BigDecimal labourRate,
        @Min(1) Integer serviceIntervalKm,
        @Min(1) Integer serviceIntervalMonths) {
}
