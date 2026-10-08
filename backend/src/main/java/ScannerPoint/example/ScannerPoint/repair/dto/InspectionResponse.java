package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.Inspection;

import java.time.LocalDateTime;

public record InspectionResponse(
        Integer jobCardId,
        LocalDateTime inspectedAt,
        String findings,
        String diagnosis,
        String recommendedAction) {

    public static InspectionResponse from(Inspection i) {
        return i == null ? null : new InspectionResponse(i.getJobCardId(), i.getInspectedAt(), i.getFindings(),
                i.getDiagnosis(), i.getRecommendedAction());
    }
}
