package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.entity.InventoryTransaction;
import ScannerPoint.example.ScannerPoint.inventory.entity.TxnType;

import java.time.LocalDateTime;

public record MovementResponse(
        Integer id,
        Integer partId,
        String partCode,
        String partName,
        TxnType txnType,
        Integer quantity,
        String supplierName,
        String performedByName,
        LocalDateTime txnAt,
        String note) {

    public static MovementResponse from(InventoryTransaction t) {
        return new MovementResponse(t.getId(), t.getPart().getId(), t.getPart().getPartCode(), t.getPart().getPartName(),
                t.getTxnType(), t.getQuantity(), t.getSupplier() == null ? null : t.getSupplier().getName(),
                t.getPerformedBy().getFullName(), t.getTxnAt(), t.getNote());
    }
}
