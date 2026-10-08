package ScannerPoint.example.ScannerPoint.repair.dto;

import java.time.LocalDateTime;

/**
 * One of the eight boxes. state: BLURRED (finished), CURRENT (where the vehicle is now),
 * UPCOMING (not reached yet).
 */
public record WorkflowBox(
        int stageNo,
        String label,
        String state,
        LocalDateTime reachedAt,
        String note) {
}
