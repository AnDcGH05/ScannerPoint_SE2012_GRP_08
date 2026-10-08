package ScannerPoint.example.ScannerPoint.inventory.controller;

import ScannerPoint.example.ScannerPoint.inventory.dto.LowStockResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.SparePartRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SparePartResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.StockCardResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierPartRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierPartResponse;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartCategory;
import ScannerPoint.example.ScannerPoint.inventory.service.SparePartService;
import ScannerPoint.example.ScannerPoint.repair.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
public class SparePartController {

    private final SparePartService partService;
    private final StaffService staffService;

    public SparePartController(SparePartService partService, StaffService staffService) {
        this.partService = partService;
        this.staffService = staffService;
    }

    /** Mechanics read the list for the "Request part" dialog. */
    @GetMapping
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN', 'MECHANIC', 'RECEPTIONIST')")
    public List<SparePartResponse> list(@RequestParam(required = false) PartCategory category,
                                        @RequestParam(defaultValue = "false") boolean lowStock,
                                        @RequestParam(defaultValue = "false") boolean includeInactive) {
        return partService.list(category, lowStock, includeInactive);
    }

    /** Low-stock alerts with the preferred supplier (query 3.1). */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public List<LowStockResponse> lowStock() {
        return partService.lowStock();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN', 'MECHANIC', 'RECEPTIONIST')")
    public SparePartResponse get(@PathVariable Integer id) {
        return partService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public SparePartResponse create(@Valid @RequestBody SparePartRequest request) {
        return partService.create(request, staffService.currentEmployee());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public SparePartResponse update(@PathVariable Integer id, @Valid @RequestBody SparePartRequest request) {
        return partService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public SparePartResponse deactivate(@PathVariable Integer id) {
        return partService.setActive(id, false);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public SparePartResponse activate(@PathVariable Integer id) {
        return partService.setActive(id, true);
    }

    @GetMapping("/{id}/stock-card")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public StockCardResponse stockCard(@PathVariable Integer id) {
        return partService.stockCard(id);
    }

    @GetMapping("/{id}/suppliers")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public List<SupplierPartResponse> suppliers(@PathVariable Integer id) {
        return partService.suppliersFor(id);
    }

    /** Add or change a supplier's price (also used to mark the preferred supplier). */
    @PostMapping("/{id}/suppliers")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public SupplierPartResponse saveSupplierPrice(@PathVariable Integer id, @Valid @RequestBody SupplierPartRequest request) {
        return partService.saveSupplierPrice(id, request);
    }

    @PutMapping("/{id}/suppliers")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public SupplierPartResponse updateSupplierPrice(@PathVariable Integer id, @Valid @RequestBody SupplierPartRequest request) {
        return partService.saveSupplierPrice(id, request);
    }

    @DeleteMapping("/{id}/suppliers/{supplierId}")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeSupplierPrice(@PathVariable Integer id, @PathVariable Integer supplierId) {
        partService.removeSupplierPrice(id, supplierId);
    }
}
