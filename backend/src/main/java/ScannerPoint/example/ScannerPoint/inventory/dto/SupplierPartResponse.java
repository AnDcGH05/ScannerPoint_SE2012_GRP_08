package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.entity.SupplierPart;

import java.math.BigDecimal;

public record SupplierPartResponse(
        Integer supplierId,
        String supplierName,
        String supplierPhone,
        Integer partId,
        String partName,
        BigDecimal unitCost,
        Integer leadTimeDays,
        boolean preferred) {

    public static SupplierPartResponse from(SupplierPart sp) {
        return new SupplierPartResponse(sp.getSupplier().getId(), sp.getSupplier().getName(),
                sp.getSupplier().getPhoneNo(), sp.getPart().getId(), sp.getPart().getPartName(), sp.getUnitCost(),
                sp.getLeadTimeDays(), Boolean.TRUE.equals(sp.getPreferred()));
    }
}
