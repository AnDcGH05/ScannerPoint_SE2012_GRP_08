package ScannerPoint.example.ScannerPoint.repair.dto;

import jakarta.validation.constraints.NotNull;

/** Customer's Approve / Reject button for one extra task. */
public record ApprovalRequest(@NotNull Boolean approved) {
}
