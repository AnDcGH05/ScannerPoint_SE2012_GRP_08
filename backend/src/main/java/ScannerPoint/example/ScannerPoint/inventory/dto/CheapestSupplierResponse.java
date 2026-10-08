package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.repository.SparePartRepository.CheapestSupplierRow;

import java.math.BigDecimal;

public record CheapestSupplierResponse(
        Integer partId,
        String partName,
        String cheapestSupplier,
        BigDecimal unitCost,
        boolean preferred) {

    public static CheapestSupplierResponse from(CheapestSupplierRow r) {
        return new CheapestSupplierResponse(r.getPartId(), r.getPartName(), r.getCheapestSupplier(),
                r.getUnitCost(), Boolean.TRUE.equals(r.getPreferred()));
    }
}
