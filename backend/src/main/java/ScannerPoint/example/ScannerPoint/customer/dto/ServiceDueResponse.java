package ScannerPoint.example.ScannerPoint.customer.dto;

import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository.ServiceDueRow;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** "Service reminders" card – predictive maintenance (query 1.3). */
public record ServiceDueResponse(
        Integer vehicleId,
        String vehicleName,
        Integer customerId,
        String owner,
        LocalDate lastServiceDate,
        Long monthsSinceService,
        Long kmSinceService,
        LocalDateTime lastReminderSent,
        String message) {

    public static ServiceDueResponse from(ServiceDueRow r) {
        String vehicle = r.getRegistrationNo() + " – " + r.getMakeModel();
        String why;
        if (r.getKmSince() != null && r.getKmSince() >= 5000) {
            why = String.format("%,d km since the last service", r.getKmSince());
        } else {
            why = r.getMonthsSince() + " months since the last service";
        }
        return new ServiceDueResponse(r.getVehicleId(), vehicle, r.getCustomerId(), r.getOwner(),
                r.getLastServiceDate(), r.getMonthsSince(), r.getKmSince(), r.getLastReminder(),
                vehicle + " is due for a service (" + why + ")");
    }
}
