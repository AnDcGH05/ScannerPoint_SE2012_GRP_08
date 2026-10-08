package ScannerPoint.example.ScannerPoint.inventory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

/** Composite key of SUPPLIER_PART (the M:N SUPPLIES relationship). */
@Embeddable
public class SupplierPartId implements Serializable {

    @Column(name = "supplier_id")
    private Integer supplierId;

    @Column(name = "part_id")
    private Integer partId;

    protected SupplierPartId() {
    }

    public SupplierPartId(Integer supplierId, Integer partId) {
        this.supplierId = supplierId;
        this.partId = partId;
    }

    public Integer getSupplierId() { return supplierId; }
    public Integer getPartId() { return partId; }

    @Override
    public boolean equals(Object o) {
        return o instanceof SupplierPartId other
                && Objects.equals(supplierId, other.supplierId) && Objects.equals(partId, other.partId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(supplierId, partId);
    }
}
