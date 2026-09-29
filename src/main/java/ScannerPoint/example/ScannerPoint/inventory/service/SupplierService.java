package ScannerPoint.example.ScannerPoint.inventory.service;

import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierResponse;
import ScannerPoint.example.ScannerPoint.inventory.entity.Supplier;
import ScannerPoint.example.ScannerPoint.inventory.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Supplier with this email already exists!");
        }

        Supplier supplier = new Supplier(
                request.getName(),
                request.getContactPerson(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
        );

        Supplier saved = supplierRepository.save(supplier);
        return mapToResponse(saved);
    }

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        return mapToResponse(supplier);
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getContactPerson(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getAddress()
        );
    }
}