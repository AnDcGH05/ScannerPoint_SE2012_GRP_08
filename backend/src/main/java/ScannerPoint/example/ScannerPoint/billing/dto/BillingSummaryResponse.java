package ScannerPoint.example.ScannerPoint.billing.dto;

import java.math.BigDecimal;

/** Admin dashboard cards. */
public record BillingSummaryResponse(
        BigDecimal totalVerifiedPayments,
        BigDecimal outstandingBalance,
        long outstandingBills,
        long slipsWaiting,
        long refundsPending,
        BigDecimal averageRating) {
}
