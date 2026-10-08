package ScannerPoint.example.ScannerPoint.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * "Record stock movement" form. For a delivery the quantity is positive and supplierId is
 * required; for an adjustment it can be + or -. reference is the GRN number or the reason.
 */
public record StockMovementRequest(
        @NotNull Integer partId,
        @NotNull Integer quantity,
        Integer supplierId,
        @Size(max = 150) String reference) {
}
