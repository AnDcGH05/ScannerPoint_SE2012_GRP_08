package ScannerPoint.example.ScannerPoint.customer.dto;

/** refund is null when no deposit had been verified (nothing to refund). */
public record CancelResponse(
        AppointmentResponse appointment,
        RefundInfo refund) {
}
