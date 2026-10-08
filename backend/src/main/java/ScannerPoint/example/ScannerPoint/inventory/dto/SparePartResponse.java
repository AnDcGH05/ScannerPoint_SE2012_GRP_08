package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.entity.PartCategory;
import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import ScannerPoint.example.ScannerPoint.inventory.entity.SupplierPart;

import java.math.BigDecimal;

public record SparePartResponse(
        Integer id,
        String partCode,
        String partName,
        PartCategory category,
        BigDecimal unitPrice,
        Integer quantityInStock,
        Integer reorderLevel,
        boolean lowStock,
        boolean active,
        String preferredSupplier) {

    public static SparePartResponse from(SparePart p, SupplierPart preferred) {
        return new SparePartResponse(p.getId(), p.getPartCode(), p.getPartName(), p.getCategory(), p.getUnitPrice(),
                p.getQuantityInStock(), p.getReorderLevel(), p.isLowStock(), Boolean.TRUE.equals(p.getActive()),
                preferred == null ? null : preferred.getSupplier().getName());
    }
}
