package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * The mechanic's next-stage button. estimatedCompletion is optional; it is used when the
 * mechanic marks the vehicle Ready and confirms the collection time.
 */
public record StageRequest(
        @NotNull JobStatus status,
        LocalDateTime estimatedCompletion) {
}
