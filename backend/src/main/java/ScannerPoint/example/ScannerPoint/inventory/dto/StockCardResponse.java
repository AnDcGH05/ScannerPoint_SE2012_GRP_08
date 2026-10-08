package ScannerPoint.example.ScannerPoint.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Stock card page: part header + ledger with running balance (for the table and the line chart). */
public record StockCardResponse(
        SparePartResponse part,
        List<Entry> entries) {

    public record Entry(
            Integer transactionId,
            LocalDateTime txnAt,
            String txnType,
            Integer quantity,
            BigDecimal balance,
            String details,
            String performedBy) {
    }
}
