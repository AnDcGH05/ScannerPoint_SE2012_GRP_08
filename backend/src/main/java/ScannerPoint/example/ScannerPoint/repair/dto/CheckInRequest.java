package ScannerPoint.example.ScannerPoint.repair.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * "Check in vehicle" modal (Stitch S2): either today's confirmed booking (appointmentId)
 * or a walk-in (vehicleId), the mileage, the mechanic and the estimated collection time.
 */
public record CheckInRequest(
        Integer appointmentId,
        Integer vehicleId,
        @NotNull @Min(0) Integer mileage,
        Integer mechanicId,
        LocalDateTime estimatedCompletion) {
}
