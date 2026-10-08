package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.ApprovalStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import ScannerPoint.example.ScannerPoint.repair.entity.TaskStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** estimatedCost = labour hours x the package's labour rate (shown to the customer for approval). */
public record TaskResponse(
        Integer jobCardId,
        Integer taskNo,
        String description,
        BigDecimal labourHours,
        boolean additional,
        ApprovalStatus approvalStatus,
        TaskStatus taskStatus,
        BigDecimal estimatedCost) {

    public static TaskResponse from(RepairTask t, BigDecimal labourRate) {
        BigDecimal cost = labourRate == null ? null
                : t.getLabourHours().multiply(labourRate).setScale(2, RoundingMode.HALF_UP);
        return new TaskResponse(t.getJobCardId(), t.getTaskNo(), t.getDescription(), t.getLabourHours(),
                Boolean.TRUE.equals(t.getAdditional()), t.getApprovalStatus(), t.getTaskStatus(), cost);
    }
}
