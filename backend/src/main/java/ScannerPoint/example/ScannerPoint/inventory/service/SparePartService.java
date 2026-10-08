package ScannerPoint.example.ScannerPoint.inventory.service;

import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.inventory.dto.InventorySummaryResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.LowStockResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.MovementResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.SparePartRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SparePartResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.StockCardResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierPartRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.SupplierPartResponse;
import ScannerPoint.example.ScannerPoint.inventory.entity.InventoryTransaction;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartCategory;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartRequestStatus;
import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import ScannerPoint.example.ScannerPoint.inventory.entity.Supplier;
import ScannerPoint.example.ScannerPoint.inventory.entity.SupplierPart;
import ScannerPoint.example.ScannerPoint.inventory.entity.SupplierPartId;
import ScannerPoint.example.ScannerPoint.inventory.entity.TxnType;
import ScannerPoint.example.ScannerPoint.inventory.repository.InventoryTransactionRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.PartRequestRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.SparePartRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.SupplierPartRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;

/** Spare parts, supplier prices, stock card and dashboard figures. */
@Service
public class SparePartService {

    private final SparePartRepository partRepository;
    private final SupplierPartRepository supplierPartRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final PartRequestRepository requestRepository;
    private final SupplierService supplierService;
    private final EntityManager entityManager;

    public SparePartService(SparePartRepository partRepository, SupplierPartRepository supplierPartRepository,
                            InventoryTransactionRepository transactionRepository, PartRequestRepository requestRepository,
                            SupplierService supplierService, EntityManager entityManager) {
        this.partRepository = partRepository;
        this.supplierPartRepository = supplierPartRepository;
        this.transactionRepository = transactionRepository;
        this.requestRepository = requestRepository;
        this.supplierService = supplierService;
        this.entityManager = entityManager;
    }

    /** ?category=&lowStock=true&includeInactive=true */
    @Transactional(readOnly = true)
    public List<SparePartResponse> list(PartCategory category, boolean lowStockOnly, boolean includeInactive) {
        return partRepository.findAllByOrderByPartCodeAsc().stream()
                .filter(p -> includeInactive || Boolean.TRUE.equals(p.getActive()))
                .filter(p -> category == null || p.getCategory() == category)
                .filter(p -> !lowStockOnly || p.isLowStock())
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SparePartResponse get(Integer id) {
        return toResponse(find(id));
    }

    /** New part; the opening stock (if any) goes through the ledger like every other movement. */
    @Transactional
    public SparePartResponse create(SparePartRequest r, Employee storekeeper) {
        String code = r.partCode().trim().toUpperCase(Locale.ROOT);
        if (partRepository.existsByPartCodeIgnoreCase(code)) {
            throw new ConflictException("A part with code " + code + " already exists");
        }
        SparePart p = new SparePart();
        p.setPartCode(code);
        apply(p, r);
        p.setActive(true);
        partRepository.saveAndFlush(p);
        if (r.openingStock() != null && r.openingStock() > 0) {
            transactionRepository.saveAndFlush(new InventoryTransaction(p, TxnType.OPENING, r.openingStock(), null,
                    storekeeper, "Opening stock count"));
        }
        entityManager.refresh(p);
        return toResponse(p);
    }

    /** Stock is not edited here – use a delivery or an adjustment. */
    @Transactional
    public SparePartResponse update(Integer id, SparePartRequest r) {
        SparePart p = find(id);
        String code = r.partCode().trim().toUpperCase(Locale.ROOT);
        if (!p.getPartCode().equalsIgnoreCase(code)) {
            if (partRepository.existsByPartCodeIgnoreCase(code)) {
                throw new ConflictException("A part with code " + code + " already exists");
            }
            p.setPartCode(code);
        }
        apply(p, r);
        partRepository.saveAndFlush(p);
        return toResponse(p);
    }

    @Transactional
    public SparePartResponse setActive(Integer id, boolean active) {
        SparePart p = find(id);
        p.setActive(active);
        return toResponse(p);
    }

    // ------------------------------------------------------------------ supplier prices

    @Transactional(readOnly = true)
    public List<SupplierPartResponse> suppliersFor(Integer partId) {
        find(partId);
        return supplierPartRepository.findByPart_IdOrderByUnitCostAsc(partId).stream()
                .map(SupplierPartResponse::from).toList();
    }

    /** Add or update one supplier's price. Marking it preferred un-marks the others. */
    @Transactional
    public SupplierPartResponse saveSupplierPrice(Integer partId, SupplierPartRequest r) {
        SparePart part = find(partId);
        Supplier supplier = supplierService.find(r.supplierId());
        SupplierPart sp = supplierPartRepository.findById(new SupplierPartId(supplier.getId(), part.getId()))
                .orElseGet(() -> new SupplierPart(supplier, part));
        sp.setUnitCost(r.unitCost());
        sp.setLeadTimeDays(r.leadTimeDays());
        boolean preferred = Boolean.TRUE.equals(r.preferred());
        if (preferred) {
            supplierPartRepository.findByPart_IdOrderByUnitCostAsc(partId).forEach(o -> o.setPreferred(false));
        }
        sp.setPreferred(preferred);
        return SupplierPartResponse.from(supplierPartRepository.saveAndFlush(sp));
    }

    @Transactional
    public void removeSupplierPrice(Integer partId, Integer supplierId) {
        SupplierPart sp = supplierPartRepository.findById(new SupplierPartId(supplierId, partId))
                .orElseThrow(() -> new NotFoundException("This supplier does not supply this part"));
        supplierPartRepository.delete(sp);
    }

    // ------------------------------------------------------------------ stock views

    @Transactional(readOnly = true)
    public StockCardResponse stockCard(Integer partId) {
        SparePart p = find(partId);
        List<StockCardResponse.Entry> entries = partRepository.stockCard(partId).stream()
                .map(r -> new StockCardResponse.Entry(r.getTransactionId(), r.getTxnAt(), r.getTxnType(),
                        r.getQuantity(), r.getBalance(), r.getDetails(), r.getPerformedBy()))
                .toList();
        return new StockCardResponse(toResponse(p), entries);
    }

    @Transactional(readOnly = true)
    public List<LowStockResponse> lowStock() {
        return partRepository.lowStock().stream().map(LowStockResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<MovementResponse> latestMovements() {
        return transactionRepository.findTop20ByOrderByTxnAtDescIdDesc().stream().map(MovementResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public InventorySummaryResponse summary() {
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        return new InventorySummaryResponse(
                requestRepository.countByStatusIn(EnumSet.of(PartRequestStatus.PENDING, PartRequestStatus.BACK_ORDERED)),
                partRepository.lowStock().size(),
                partRepository.receiptsSince(monday.atStartOfDay()),
                partRepository.stockValue());
    }

    public SparePart find(Integer id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Spare part not found with id: " + id));
    }

    private static void apply(SparePart p, SparePartRequest r) {
        p.setPartName(r.partName().trim());
        p.setCategory(r.category());
        p.setUnitPrice(r.unitPrice());
        p.setReorderLevel(r.reorderLevel());
    }

    private SparePartResponse toResponse(SparePart p) {
        return SparePartResponse.from(p, supplierPartRepository.findFirstByPart_IdAndPreferredTrue(p.getId()).orElse(null));
    }
}
