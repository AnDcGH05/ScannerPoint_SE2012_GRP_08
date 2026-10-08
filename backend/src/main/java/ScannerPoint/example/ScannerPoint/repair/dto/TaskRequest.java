package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.TaskStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Add / edit a repair task. additional = "Extra work (needs customer approval)" toggle;
 * it can only be set when the task is created. taskStatus is used when editing.
 */
public record TaskRequest(
        @NotBlank @Size(max = 150) String description,
        @NotNull @DecimalMin(value = "0.1", message = "Labour hours must be more than 0") @DecimalMax("999.9") BigDecimal labourHours,
        Boolean additional,
        TaskStatus taskStatus) {
}
