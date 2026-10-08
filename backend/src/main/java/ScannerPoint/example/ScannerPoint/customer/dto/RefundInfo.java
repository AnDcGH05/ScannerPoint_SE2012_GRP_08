package ScannerPoint.example.ScannerPoint.customer.dto;

import java.math.BigDecimal;

/** The REFUND row written by sp_cancel_appointment. */
public record RefundInfo(
        Integer refundId,
        BigDecimal depositPaid,
        Integer noticeHours,
        BigDecimal penaltyAmount,
        BigDecimal refundAmount,
        String status) {
}
