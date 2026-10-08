package ScannerPoint.example.ScannerPoint.customer.dto;

import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.customer.entity.AppointmentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A booking as the customer and receptionist see it.
 * depositStatus: NOT_UPLOADED, PENDING, VERIFIED or REJECTED (latest deposit slip).
 * paymentReference is what the customer writes on the bank transfer, e.g. BOOKING-0012.
 */
public record AppointmentResponse(
        Integer id,
        Integer customerId,
        String customerName,
        Integer vehicleId,
        String vehicleName,
        String registrationNo,
        Integer packageId,
        String packageName,
        PricingType pricingType,
        LocalDateTime scheduledAt,
        Integer bayNo,
        AppointmentStatus status,
        String problemDescription,
        BigDecimal depositAmount,
        BigDecimal depositPaid,
        String depositStatus,
        String paymentReference,
        LocalDateTime confirmedAt,
        String confirmedByName,
        LocalDateTime cancelledAt,
        LocalDateTime createdAt,
        Integer jobCardId) {
}
