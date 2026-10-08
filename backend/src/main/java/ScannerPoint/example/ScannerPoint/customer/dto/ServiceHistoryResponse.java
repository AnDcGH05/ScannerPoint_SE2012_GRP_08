package ScannerPoint.example.ScannerPoint.customer.dto;

import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository.ServiceHistoryRow;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** One visit in the vehicle's digital service history. */
public record ServiceHistoryResponse(
        Integer jobCardId,
        LocalDateTime checkInAt,
        Integer mileage,
        String status,
        String packageName,
        String diagnosis,
        long tasksDone,
        BigDecimal invoiceTotal) {

    public static ServiceHistoryResponse from(ServiceHistoryRow r) {
        return new ServiceHistoryResponse(r.getJobCardId(), r.getCheckInAt(), r.getMileage(), r.getStatus(),
                r.getPackageName(), r.getDiagnosis(), r.getTasksDone() == null ? 0 : r.getTasksDone(), r.getInvoiceTotal());
    }
}
