package ScannerPoint.example.ScannerPoint.inventory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/** Which supplier sells which part, at what cost and lead time; one supplier is preferred. */
@Entity
@Table(name = "supplier_part")
public class SupplierPart {

    @EmbeddedId
    private SupplierPartId id;

    @MapsId("supplierId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @MapsId("partId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id")
    private SparePart part;

    @Column(name = "unit_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "lead_time_days", nullable = false, columnDefinition = "tinyint unsigned")
    private Integer leadTimeDays = 1;

    @Column(name = "is_preferred", nullable = false)
    private Boolean preferred = false;

    protected SupplierPart() {
    }

    public SupplierPart(Supplier supplier, SparePart part) {
        this.id = new SupplierPartId(supplier.getId(), part.getId());
        this.supplier = supplier;
        this.part = part;
    }

    public SupplierPartId getId() { return id; }
    public Supplier getSupplier() { return supplier; }
    public SparePart getPart() { return part; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }
    public Boolean getPreferred() { return preferred; }
    public void setPreferred(Boolean preferred) { this.preferred = preferred; }
}
