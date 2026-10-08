package ScannerPoint.example.ScannerPoint.inventory.event;

/** Published after a stock movement leaves a part at or below its re-order level. */
public record LowStockEvent(
        Integer partId,
        String partCode,
        String partName,
        int inStock,
        int reorderLevel) {
}
