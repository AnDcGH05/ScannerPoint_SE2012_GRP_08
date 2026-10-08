package ScannerPoint.example.ScannerPoint.inventory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** The mechanic's "Request part" dialog. */
public record PartRequestCreate(
        @NotNull Integer jobCardId,
        @NotNull Integer partId,
        @NotNull @Min(1) @Max(1000) Integer quantity) {
}
