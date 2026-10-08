package ScannerPoint.example.ScannerPoint.customer.dto;

import ScannerPoint.example.ScannerPoint.customer.entity.FuelType;
import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;

import java.time.LocalDate;
import java.util.List;

public record VehicleResponse(
        Integer id,
        Integer customerId,
        String ownerName,
        String registrationNo,
        String provinceCode,
        String make,
        String model,
        String displayName,
        Integer manufactureYear,
        FuelType fuelType,
        Integer currentMileage,
        LocalDate lastServiceDate,
        Integer lastServiceMileage,
        boolean hasServiceHistory,
        List<DocumentResponse> documents) {

    public static VehicleResponse from(Vehicle v, boolean hasHistory, List<DocumentResponse> documents) {
        return new VehicleResponse(v.getId(), v.getCustomer().getId(), v.getCustomer().getFullName(),
                v.getRegistrationNo(), v.getProvinceCode(), v.getMake(), v.getModel(), v.getDisplayName(),
                v.getManufactureYear(), v.getFuelType(), v.getCurrentMileage(), v.getLastServiceDate(),
                v.getLastServiceMileage(), hasHistory, documents);
    }
}
