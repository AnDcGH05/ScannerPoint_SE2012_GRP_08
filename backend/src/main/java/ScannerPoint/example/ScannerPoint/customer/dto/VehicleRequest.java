package ScannerPoint.example.ScannerPoint.customer.dto;

import ScannerPoint.example.ScannerPoint.customer.entity.FuelType;
import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Add / edit vehicle drawer (Stitch A3). customerId is only used when staff add a vehicle. */
public record VehicleRequest(
        Integer customerId,
        @NotBlank @Pattern(regexp = Vehicle.PLATE_REGEX, message = "Number plate must look like WP-CAV-9548") String registrationNo,
        @NotBlank @Size(max = 30) String make,
        @NotBlank @Size(max = 30) String model,
        @NotNull @Min(1950) @Max(2100) Integer manufactureYear,
        @NotNull FuelType fuelType,
        @NotNull @Min(0) Integer currentMileage,
        @PastOrPresent LocalDate lastServiceDate,
        @Min(0) Integer lastServiceMileage) {
}
