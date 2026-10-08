package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** One card on the job board / mechanic dashboard. balanceDue is null until a bill exists. */
public record JobCardResponse(
        Integer id,
        Integer vehicleId,
        String vehicleName,
        String registrationNo,
        Integer customerId,
        String customerName,
        Integer appointmentId,
        String packageName,
        Integer mechanicId,
        String mechanicName,
        String createdByName,
        LocalDateTime checkInAt,
        Integer checkInMileage,
        JobStatus status,
        String statusLabel,
        LocalDateTime statusChangedAt,
        long hoursInStage,
        LocalDateTime estimatedCompletion,
        LocalDateTime completedAt,
        long pendingApprovals,
        long openPartRequests,
        BigDecimal balanceDue,
        boolean canRelease) {
}
