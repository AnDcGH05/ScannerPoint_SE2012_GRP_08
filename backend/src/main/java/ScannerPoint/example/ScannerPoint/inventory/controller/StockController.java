package ScannerPoint.example.ScannerPoint.inventory.controller;

import ScannerPoint.example.ScannerPoint.inventory.dto.InventorySummaryResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.MovementResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.StockMovementRequest;
import ScannerPoint.example.ScannerPoint.inventory.event.LowStockAlertListener;
import ScannerPoint.example.ScannerPoint.inventory.service.SparePartService;
import ScannerPoint.example.ScannerPoint.inventory.service.StockService;
import ScannerPoint.example.ScannerPoint.repair.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;
    private final SparePartService partService;
    private final StaffService staffService;
    private final LowStockAlertListener alerts;

    public StockController(StockService stockService, SparePartService partService, StaffService staffService,
                           LowStockAlertListener alerts) {
        this.stockService = stockService;
        this.partService = partService;
        this.staffService = staffService;
        this.alerts = alerts;
    }

    @PostMapping("/receipts")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse receipt(@Valid @RequestBody StockMovementRequest request) {
        return stockService.recordReceipt(request, staffService.currentEmployee());
    }

    @PostMapping("/returns")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse returnToStore(@Valid @RequestBody StockMovementRequest request) {
        return stockService.recordReturn(request, staffService.currentEmployee());
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse adjustment(@Valid @RequestBody StockMovementRequest request) {
        return stockService.recordAdjustment(request, staffService.currentEmployee());
    }

    /** "Latest movements" feed. */
    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public List<MovementResponse> movements() {
        return partService.latestMovements();
    }

    /** Summary cards on the storekeeper dashboard. */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public InventorySummaryResponse summary() {
        return partService.summary();
    }

    /** Alerts raised by the low-stock observer since the server started. */
    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public List<LowStockAlertListener.Alert> alerts() {
        return alerts.latest();
    }
}
