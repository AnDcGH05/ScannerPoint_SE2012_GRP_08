package ScannerPoint.example.ScannerPoint.inventory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * quantity_in_stock is read only in Java: stock changes ONLY through the
 * INVENTORY_TRANSACTION ledger, and trg_inv_txn_apply keeps this column equal to the
 * sum of the ledger.
 */
@Entity
@Table(name = "spare_part")
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_id")
    private Integer id;

    @Column(name = "part_code", nullable = false, unique = true, length = 20)
    private String partCode;

    @Column(name = "part_name", nullable = false, length = 100)
    private String partName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartCategory category;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "quantity_in_stock", nullable = false, insertable = false, updatable = false)
    private Integer quantityInStock = 0;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    public boolean isLowStock() {
        return quantityInStock != null && quantityInStock <= reorderLevel;
    }

    public Integer getId() { return id; }
    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }
    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }
    public PartCategory getCategory() { return category; }
    public void setCategory(PartCategory category) { this.category = category; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Integer getQuantityInStock() { return quantityInStock; }
    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
