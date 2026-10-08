package ScannerPoint.example.ScannerPoint.customer.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record RescheduleRequest(
        @NotNull @Future(message = "Choose a time in the future") LocalDateTime scheduledAt,
        @Min(1) @Max(4) Integer bayNo) {
}
