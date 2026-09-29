package ScannerPoint.example.ScannerPoint.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @Column(nullable = false)
    private String transactionType; // RESTOCK, DISPENSE, ADJUSTMENT

    @Column(nullable = false)
    private Integer quantity;

    private LocalDateTime transactionDate = LocalDateTime.now();

    private String notes;

    public InventoryTransaction() {}

    public InventoryTransaction(SparePart sparePart, String transactionType, Integer quantity, String notes) {
        this.sparePart = sparePart;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SparePart getSparePart() { return sparePart; }
    public void setSparePart(SparePart sparePart) { this.sparePart = sparePart; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}