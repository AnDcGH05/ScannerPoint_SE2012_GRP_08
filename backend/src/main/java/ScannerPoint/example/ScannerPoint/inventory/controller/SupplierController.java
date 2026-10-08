package ScannerPoint.example.ScannerPoint.inventory.controller;

import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierResponse;
import ScannerPoint.example.ScannerPoint.inventory.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public List<SupplierResponse> list() {
        return supplierService.list();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public SupplierResponse get(@PathVariable Integer id) {
        return supplierService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierResponse create(@Valid @RequestBody SupplierRequest request) {
        return supplierService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public SupplierResponse update(@PathVariable Integer id, @Valid @RequestBody SupplierRequest request) {
        return supplierService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        supplierService.delete(id);
    }
}
