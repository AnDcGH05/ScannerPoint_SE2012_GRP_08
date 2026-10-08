package ScannerPoint.example.ScannerPoint.repair.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Smart repair workflow for the customer dashboard (same rules as query 2.2 and section 10
 * of the work plan). A cancelled booking has cancelled = true and a message instead of boxes.
 */
public record WorkflowResponse(
        Integer appointmentId,
        Integer jobCardId,
        String vehicleName,
        String packageName,
        String currentStage,
        LocalDateTime estimatedCompletion,
        long extraWorkAwaitingApproval,
        boolean cancelled,
        String cancelMessage,
        List<WorkflowBox> boxes) {
}
