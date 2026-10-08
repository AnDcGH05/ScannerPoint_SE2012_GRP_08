package ScannerPoint.example.ScannerPoint.customer.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * The live calculation in the cancel modal (Stitch A5).
 * 24 hours or more before the booked time: full refund; less: 50% of the deposit is kept.
 */
public record CancelPreviewResponse(
        Integer appointmentId,
        LocalDateTime scheduledAt,
        LocalDateTime cancelAt,
        long noticeHours,
        BigDecimal depositPaid,
        BigDecimal penaltyAmount,
        BigDecimal refundAmount,
        boolean fullRefund,
        String message) {
}
