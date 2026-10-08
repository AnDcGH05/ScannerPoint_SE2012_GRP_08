package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatusHistory;

import java.time.LocalDateTime;

public record HistoryResponse(
        JobStatus status,
        String label,
        LocalDateTime changedAt,
        String changedByName) {

    public static HistoryResponse from(JobStatusHistory h) {
        return new HistoryResponse(h.getStatus(), h.getStatus().getLabel(), h.getChangedAt(),
                h.getChangedBy() == null ? null : h.getChangedBy().getFullName());
    }
}
