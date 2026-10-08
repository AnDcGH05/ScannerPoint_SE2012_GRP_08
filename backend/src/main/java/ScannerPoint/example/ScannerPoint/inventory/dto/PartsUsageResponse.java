package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.repository.SparePartRepository.PartsUsageRow;

import java.math.BigDecimal;

public record PartsUsageResponse(
        Integer partId,
        String partCode,
        String partName,
        long qtyIssued,
        long jobs,
        BigDecimal valueIssued) {

    public static PartsUsageResponse from(PartsUsageRow r) {
        return new PartsUsageResponse(r.getPartId(), r.getPartCode(), r.getPartName(),
                r.getQtyIssued() == null ? 0 : r.getQtyIssued().longValue(),
                r.getJobs() == null ? 0 : r.getJobs(), r.getValueIssued());
    }
}
