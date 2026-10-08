package ScannerPoint.example.ScannerPoint.inventory.service;

import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.inventory.dto.MovementResponse;
import ScannerPoint.example.ScannerPoint.inventory.dto.StockMovementRequest;
import ScannerPoint.example.ScannerPoint.inventory.entity.InventoryTransaction;
import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import ScannerPoint.example.ScannerPoint.inventory.entity.Supplier;
import ScannerPoint.example.ScannerPoint.inventory.entity.TxnType;
import ScannerPoint.example.ScannerPoint.inventory.event.LowStockEvent;
import ScannerPoint.example.ScannerPoint.inventory.repository.InventoryTransactionRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.SparePartRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.SupplierRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Deliveries, returns and adjustments. Each one is a row in the stock ledger; the
 * triggers refuse negative stock (409) and update spare_part.quantity_in_stock.
 */
@Service
public class StockService {

    private final InventoryTransactionRepository transactionRepository;
    private final SparePartRepository partRepository;
    private final SupplierRepository supplierRepository;
    private final ApplicationEventPublisher events;

    public StockService(InventoryTransactionRepository transactionRepository, SparePartRepository partRepository,
                        SupplierRepository supplierRepository, ApplicationEventPublisher events) {
        this.transactionRepository = transactionRepository;
        this.partRepository = partRepository;
        this.supplierRepository = supplierRepository;
        this.events = events;
    }

    /** Delivery from a supplier: positive quantity, supplier required (chk_txn_supplier). */
    @Transactional
    public MovementResponse recordReceipt(StockMovementRequest r, Employee storekeeper) {
        if (r.quantity() <= 0) {
            throw new BadRequestException("A delivery must have a positive quantity");
        }
        if (r.supplierId() == null) {
            throw new BadRequestException("Choose the supplier for a delivery");
        }
        Supplier supplier = supplierRepository.findById(r.supplierId())
                .orElseThrow(() -> new NotFoundException("Supplier not found with id: " + r.supplierId()));
        return save(part(r.partId()), TxnType.RECEIPT, r.quantity(), supplier, storekeeper, r.reference());
    }

    /** A part brought back to the store (e.g. not used on a job). */
    @Transactional
    public MovementResponse recordReturn(StockMovementRequest r, Employee storekeeper) {
        if (r.quantity() <= 0) {
            throw new BadRequestException("A return must have a positive quantity");
        }
        return save(part(r.partId()), TxnType.RETURN, r.quantity(), null, storekeeper, r.reference());
    }

    /** Stock count correction (+ or -); a reason is required. */
    @Transactional
    public MovementResponse recordAdjustment(StockMovementRequest r, Employee storekeeper) {
        if (r.quantity() == 0) {
            throw new BadRequestException("An adjustment cannot be zero");
        }
        if (r.reference() == null || r.reference().isBlank()) {
            throw new BadRequestException("Give a reason for the adjustment");
        }
        return save(part(r.partId()), TxnType.ADJUSTMENT, r.quantity(), null, storekeeper, r.reference());
    }

    /** Observer pattern: tell the listeners when a part reaches its re-order level. */
    public void publishIfLowStock(SparePart part) {
        Integer stock = partRepository.currentStock(part.getId());
        if (stock != null && stock <= part.getReorderLevel() && Boolean.TRUE.equals(part.getActive())) {
            events.publishEvent(new LowStockEvent(part.getId(), part.getPartCode(), part.getPartName(),
                    stock, part.getReorderLevel()));
        }
    }

    private MovementResponse save(SparePart part, TxnType type, int qty, Supplier supplier, Employee by, String note) {
        InventoryTransaction t = transactionRepository.saveAndFlush(new InventoryTransaction(part, type, qty, supplier, by,
                note == null || note.isBlank() ? null : note.trim()));
        publishIfLowStock(part);
        return MovementResponse.from(t);
    }

    private SparePart part(Integer id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Spare part not found with id: " + id));
    }
}
