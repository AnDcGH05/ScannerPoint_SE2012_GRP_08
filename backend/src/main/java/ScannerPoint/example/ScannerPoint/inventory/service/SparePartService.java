package ScannerPoint.example.ScannerPoint.inventory.service;

import ScannerPoint.example.ScannerPoint.inventory.dto.SparePartRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SparePartResponse;
import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import ScannerPoint.example.ScannerPoint.inventory.entity.Supplier;
import ScannerPoint.example.ScannerPoint.inventory.repository.SparePartRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;

@Service
public class SparePartService {

    private final SparePartRepository sparePartRepository;
    private final SupplierRepository supplierRepository;

    public SparePartService(SparePartRepository sparePartRepository, SupplierRepository supplierRepository) {
        this.sparePartRepository = sparePartRepository;
        this.supplierRepository = supplierRepository;
    }

    public SparePartResponse createSparePart(SparePartRequest request) {
        if (sparePartRepository.existsByPartNumber(request.getPartNumber())) {
            throw new ConflictException("Part number already exists!");
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new NotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        SparePart sparePart = new SparePart(
                request.getPartNumber(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getQuantityInStock(),
                request.getReorderLevel(),
                supplier
        );

        SparePart saved = sparePartRepository.save(sparePart);
        return mapToResponse(saved);
    }

    public List<SparePartResponse> getAllSpareParts() {
        return sparePartRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SparePartResponse> getLowStockSpareParts() {
        return sparePartRepository.findLowStockParts().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SparePartResponse mapToResponse(SparePart part) {
        Long supplierId = (part.getSupplier() != null) ? part.getSupplier().getId() : null;
        String supplierName = (part.getSupplier() != null) ? part.getSupplier().getName() : "None";
        boolean isLowStock = part.getQuantityInStock() <= part.getReorderLevel();

        return new SparePartResponse(
                part.getId(),
                part.getPartNumber(),
                part.getName(),
                part.getDescription(),
                part.getPrice(),
                part.getQuantityInStock(),
                part.getReorderLevel(),
                isLowStock,
                supplierId,
                supplierName
        );
    }
}