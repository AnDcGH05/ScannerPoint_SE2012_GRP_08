package ScannerPoint.example.ScannerPoint.inventory.dto;

import java.math.BigDecimal;

/** The four cards at the top of the storekeeper dashboard (Stitch T1). */
public record InventorySummaryResponse(
        long pendingPartRequests,
        long lowStockParts,
        long deliveriesThisWeek,
        BigDecimal stockValue) {
}
