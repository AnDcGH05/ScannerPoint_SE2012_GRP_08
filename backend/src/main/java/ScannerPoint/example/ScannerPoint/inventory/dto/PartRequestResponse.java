package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.entity.PartRequest;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartRequestStatus;

import java.time.LocalDateTime;

/** One row of the storekeeper's request queue (query 3.5). */
public record PartRequestResponse(
        Integer id,
        Integer jobCardId,
        String vehicleName,
        String mechanicName,
        Integer partId,
        String partCode,
        String partName,
        Integer quantity,
        Integer inStock,
        String suggestedAction,
        LocalDateTime requestedAt,
        PartRequestStatus status,
        String handledByName,
        LocalDateTime handledAt,
        String rejectReason) {

    public static PartRequestResponse from(PartRequest r) {
        var jc = r.getJobCard();
        var part = r.getPart();
        int stock = part.getQuantityInStock() == null ? 0 : part.getQuantityInStock();
        return new PartRequestResponse(r.getId(), jc.getId(), jc.getVehicle().getDisplayName(),
                jc.getMechanic() == null ? "Unassigned" : jc.getMechanic().getFullName(),
                part.getId(), part.getPartCode(), part.getPartName(), r.getQuantity(), stock,
                stock >= r.getQuantity() ? "Can issue" : "Not enough stock",
                r.getRequestedAt(), r.getStatus(),
                r.getHandledBy() == null ? null : r.getHandledBy().getFullName(),
                r.getHandledAt(), r.getRejectReason());
    }
}
