package ScannerPoint.example.ScannerPoint.customer.dto;

import ScannerPoint.example.ScannerPoint.customer.entity.DocStatus;
import ScannerPoint.example.ScannerPoint.customer.entity.DocType;
import ScannerPoint.example.ScannerPoint.customer.entity.VehicleDocument;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public record DocumentResponse(
        Integer id,
        Integer vehicleId,
        String registrationNo,
        String vehicleName,
        String ownerName,
        DocType docType,
        String documentNo,
        LocalDate expiryDate,
        long daysToExpiry,
        boolean expiringSoon,
        LocalDateTime uploadedAt,
        DocStatus status,
        String verifiedByName,
        LocalDateTime verifiedAt,
        String rejectReason,
        String fileUrl) {

    public static DocumentResponse from(VehicleDocument d) {
        long days = ChronoUnit.DAYS.between(LocalDate.now(), d.getExpiryDate());
        return new DocumentResponse(d.getId(), d.getVehicle().getId(), d.getVehicle().getRegistrationNo(),
                d.getVehicle().getDisplayName(), d.getVehicle().getCustomer().getFullName(), d.getDocType(),
                d.getDocumentNo(), d.getExpiryDate(), days, days <= 30,
                d.getUploadedAt(), d.getStatus(),
                d.getVerifiedBy() == null ? null : d.getVerifiedBy().getFullName(),
                d.getVerifiedAt(), d.getRejectReason(), "/api/documents/" + d.getId() + "/file");
    }
}
