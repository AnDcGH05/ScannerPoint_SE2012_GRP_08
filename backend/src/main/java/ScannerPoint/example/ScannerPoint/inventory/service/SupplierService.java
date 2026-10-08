package ScannerPoint.example.ScannerPoint.inventory.service;

import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierResponse;
import ScannerPoint.example.ScannerPoint.inventory.entity.Supplier;
import ScannerPoint.example.ScannerPoint.inventory.repository.SupplierPartRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierPartRepository supplierPartRepository;

    public SupplierService(SupplierRepository supplierRepository, SupplierPartRepository supplierPartRepository) {
        this.supplierRepository = supplierRepository;
        this.supplierPartRepository = supplierPartRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> list() {
        return supplierRepository.findAllByOrderByNameAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SupplierResponse get(Integer id) {
        return toResponse(find(id));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest r) {
        if (supplierRepository.existsByNameIgnoreCase(r.name().trim())) {
            throw new ConflictException("A supplier with this name already exists");
        }
        Supplier s = new Supplier();
        apply(s, r);
        return toResponse(supplierRepository.saveAndFlush(s));
    }

    @Transactional
    public SupplierResponse update(Integer id, SupplierRequest r) {
        Supplier s = find(id);
        if (!s.getName().equalsIgnoreCase(r.name().trim()) && supplierRepository.existsByNameIgnoreCase(r.name().trim())) {
            throw new ConflictException("A supplier with this name already exists");
        }
        apply(s, r);
        return toResponse(supplierRepository.saveAndFlush(s));
    }

    /** A supplier that appears in the stock ledger cannot be deleted (the FK refuses it -> 409). */
    @Transactional
    public void delete(Integer id) {
        Supplier s = find(id);
        supplierPartRepository.deleteAll(supplierPartRepository.findBySupplier_Id(id));
        supplierRepository.delete(s);
        supplierRepository.flush();
    }

    public Supplier find(Integer id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Supplier not found with id: " + id));
    }

    private static void apply(Supplier s, SupplierRequest r) {
        s.setName(r.name().trim());
        s.setContactPerson(r.contactPerson().trim());
        s.setPhoneNo(r.phoneNo());
        s.setEmail(r.email() == null || r.email().isBlank() ? null : r.email().trim().toLowerCase());
        s.setCity(r.city().trim());
    }

    private SupplierResponse toResponse(Supplier s) {
        List<String> parts = supplierPartRepository.findBySupplier_Id(s.getId()).stream()
                .map(sp -> sp.getPart().getPartName()).sorted().toList();
        return SupplierResponse.from(s, parts);
    }
}
