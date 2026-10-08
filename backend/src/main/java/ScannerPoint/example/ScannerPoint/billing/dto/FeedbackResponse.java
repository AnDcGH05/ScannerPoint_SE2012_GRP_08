package ScannerPoint.example.ScannerPoint.billing.dto;

import ScannerPoint.example.ScannerPoint.billing.entity.Feedback;

import java.time.LocalDateTime;

public record FeedbackResponse(
        Integer jobCardId,
        Integer rating,
        String comments,
        LocalDateTime submittedAt,
        String customerName,
        String vehicleName,
        String mechanicName,
        String packageName) {

    public static FeedbackResponse from(Feedback f) {
        var jc = f.getJobCard();
        return new FeedbackResponse(f.getJobCardId(), f.getRating(), f.getComments(), f.getSubmittedAt(),
                jc.getVehicle().getCustomer().getFullName(), jc.getVehicle().getDisplayName(),
                jc.getMechanic() == null ? null : jc.getMechanic().getFullName(),
                jc.getAppointment() == null ? "Walk-in" : jc.getAppointment().getServiceType().getName());
    }
}
