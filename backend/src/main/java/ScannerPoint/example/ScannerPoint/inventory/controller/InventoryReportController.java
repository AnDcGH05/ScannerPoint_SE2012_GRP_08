package ScannerPoint.example.ScannerPoint.inventory.controller;

import ScannerPoint.example.ScannerPoint.inventory.dto.CheapestSupplierResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.PartsUsageResponse;
import ScannerPoint.example.ScannerPoint.inventory.repository.SparePartRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;
import java.util.List;

/** Inventory reports (queries 3.2 and 3.3). */
@RestController
@RequestMapping("/api/reports")
public class InventoryReportController {

    private final SparePartRepository partRepository;

    public InventoryReportController(SparePartRepository partRepository) {
        this.partRepository = partRepository;
    }

    /** ?month=2026-09 (default: this month). */
    @GetMapping("/parts-usage")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @Transactional(readOnly = true)
    public List<PartsUsageResponse> partsUsage(@RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        YearMonth m = month == null ? YearMonth.now() : month;
        return partRepository.partsUsage(m.atDay(1), m.plusMonths(1).atDay(1)).stream()
                .map(PartsUsageResponse::from).toList();
    }

    @GetMapping("/cheapest-suppliers")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @Transactional(readOnly = true)
    public List<CheapestSupplierResponse> cheapestSuppliers() {
        return partRepository.cheapestSuppliers().stream().map(CheapestSupplierResponse::from).toList();
    }
}
