package ScannerPoint.example.ScannerPoint.inventory.controller;

import ScannerPoint.example.ScannerPoint.inventory.dto.SparePartRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SparePartResponse;
import ScannerPoint.example.ScannerPoint.inventory.service.SparePartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spare-parts")
public class SparePartController {

    private final SparePartService sparePartService;

    public SparePartController(SparePartService sparePartService) {
        this.sparePartService = sparePartService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER')")
    public ResponseEntity<SparePartResponse> createSparePart(@Valid @RequestBody SparePartRequest request) {
        return new ResponseEntity<>(sparePartService.createSparePart(request), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER', 'MECHANIC')")
    public ResponseEntity<List<SparePartResponse>> getAllSpareParts() {
        return ResponseEntity.ok(sparePartService.getAllSpareParts());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER')")
    public ResponseEntity<List<SparePartResponse>> getLowStockSpareParts() {
        return ResponseEntity.ok(sparePartService.getLowStockSpareParts());
    }
}