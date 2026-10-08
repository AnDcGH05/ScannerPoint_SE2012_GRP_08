package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.repository.SparePartRepository.LowStockRow;

public record LowStockResponse(
        Integer partId,
        String partCode,
        String partName,
        Integer inStock,
        Integer reorderLevel,
        Integer supplierId,
        String preferredSupplier,
        String supplierPhone,
        Integer leadTimeDays) {

    public static LowStockResponse from(LowStockRow r) {
        return new LowStockResponse(r.getPartId(), r.getPartCode(), r.getPartName(), r.getInStock(),
                r.getReorderLevel(), r.getSupplierId(), r.getPreferredSupplier(), r.getSupplierPhone(),
                r.getLeadTimeDays());
    }
}
