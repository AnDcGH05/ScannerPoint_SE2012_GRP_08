package ScannerPoint.example.ScannerPoint.repair.dto;

import jakarta.validation.constraints.NotNull;

public record AssignMechanicRequest(@NotNull Integer mechanicId) {
}
