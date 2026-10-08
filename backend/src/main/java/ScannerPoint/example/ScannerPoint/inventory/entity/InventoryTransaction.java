package ScannerPoint.example.ScannerPoint.inventory.entity;

import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/**
 * The stock ledger: insert only (never updated or deleted). Positive quantity = into the
 * store, negative = out. trg_inv_txn_check refuses negative stock; trg_inv_txn_apply
 * updates spare_part.quantity_in_stock.
 */
@Entity
@Immutable
@Table(name = "inventory_transaction")
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id", nullable = false)
    private SparePart part;

    @Enumerated(EnumType.STRING)
    @Column(name = "txn_type", nullable = false)
    private TxnType txnType;

    @Column(nullable = false)
    private Integer quantity;

    /** Only RECEIPT rows name a supplier (chk_txn_supplier). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by", nullable = false)
    private Employee performedBy;

    @Column(name = "txn_at", nullable = false)
    private LocalDateTime txnAt = LocalDateTime.now();

    @Column(length = 150)
    private String note;

    protected InventoryTransaction() {
    }

    public InventoryTransaction(SparePart part, TxnType txnType, Integer quantity, Supplier supplier,
                                Employee performedBy, String note) {
        this.part = part;
        this.txnType = txnType;
        this.quantity = quantity;
        this.supplier = supplier;
        this.performedBy = performedBy;
        this.note = note;
    }

    public Integer getId() { return id; }
    public SparePart getPart() { return part; }
    public TxnType getTxnType() { return txnType; }
    public Integer getQuantity() { return quantity; }
    public Supplier getSupplier() { return supplier; }
    public Employee getPerformedBy() { return performedBy; }
    public LocalDateTime getTxnAt() { return txnAt; }
    public String getNote() { return note; }
}
