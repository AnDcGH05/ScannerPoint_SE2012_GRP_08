package ScannerPoint.example.ScannerPoint.customer.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/** Booking wizard (Stitch A4): package, vehicle & problem, date & time. Bay is optional. */
public record BookingRequest(
        @NotNull Integer serviceTypeId,
        @NotNull Integer vehicleId,
        @NotNull @Future(message = "Choose a time in the future") LocalDateTime scheduledAt,
        @Size(max = 255) String problemDescription,
        @Min(1) @Max(4) Integer bayNo) {
}
