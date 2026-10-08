package ScannerPoint.example.ScannerPoint.billing.dto;

import ScannerPoint.example.ScannerPoint.billing.entity.PaymentStatus;
import ScannerPoint.example.ScannerPoint.billing.entity.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A payment slip. payingFor is "Booking 11" or "INV-2026-0005". amountMatches is false
 * when the slip amount differs from what is expected (the row is highlighted in W2).
 */
public record PaymentResponse(
        Integer id,
        PaymentType type,
        Integer appointmentId,
        Integer invoiceId,
        String payingFor,
        Integer customerId,
        String customerName,
        BigDecimal amount,
        BigDecimal amountExpected,
        boolean amountMatches,
        String bankReference,
        LocalDate paidOn,
        LocalDateTime uploadedAt,
        long hoursWaiting,
        PaymentStatus status,
        String verifiedByName,
        LocalDateTime verifiedAt,
        String rejectReason,
        String slipUrl) {
}
