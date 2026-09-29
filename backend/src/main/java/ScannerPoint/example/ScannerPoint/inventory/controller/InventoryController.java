package ScannerPoint.example.ScannerPoint.inventory.controller;

import ScannerPoint.example.ScannerPoint.inventory.dto.InventoryResponse;
import ScannerPoint.example.ScannerPoint.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/restock")
    @PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER')")
    public ResponseEntity<InventoryResponse> restockPart(@RequestParam Long partId,
                                                         @RequestParam Integer quantity,
                                                         @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(inventoryService.restockPart(partId, quantity, notes));
    }

    @PostMapping("/dispense")
    @PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER', 'MECHANIC')")
    public ResponseEntity<String> dispensePartForJob(@RequestParam Long jobCardId,
                                                     @RequestParam Long partId,
                                                     @RequestParam Integer quantity) {
        inventoryService.dispensePartForJob(jobCardId, partId, quantity);
        return ResponseEntity.ok("Spare part dispensed successfully for Job Card #" + jobCardId);
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER')")
    public ResponseEntity<List<InventoryResponse>> getAllTransactions() {
        return ResponseEntity.ok(inventoryService.getAllTransactions());
    }
}