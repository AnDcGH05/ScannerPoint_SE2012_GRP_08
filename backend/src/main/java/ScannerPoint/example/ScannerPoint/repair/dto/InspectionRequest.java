package ScannerPoint.example.ScannerPoint.repair.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InspectionRequest(
        @NotBlank @Size(max = 255) String findings,
        @Size(max = 255) String diagnosis,
        @Size(max = 255) String recommendedAction) {
}
