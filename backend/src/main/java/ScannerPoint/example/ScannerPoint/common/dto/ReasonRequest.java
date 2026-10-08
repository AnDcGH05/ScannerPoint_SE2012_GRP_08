package ScannerPoint.example.ScannerPoint.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body for every "Reject" button: documents, payment slips and part requests. */
public record ReasonRequest(
        @NotBlank(message = "Please give a reason") @Size(max = 150) String reason) {
}
