package ScannerPoint.example.ScannerPoint.billing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** One bill line. line_amount is a generated column (quantity x unit_price) – read only. */
@Entity
@Table(name = "invoice_item")
@IdClass(InvoiceItemId.class)
public class InvoiceItem {

    @Id
    @Column(name = "invoice_id")
    private Integer invoiceId;

    @Id
    @Column(name = "line_no", columnDefinition = "tinyint unsigned")
    private Integer lineNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    private ItemType itemType;

    @Column(nullable = false, length = 150)
    private String description;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_amount", precision = 12, scale = 2, insertable = false, updatable = false)
    private BigDecimal lineAmount;

    protected InvoiceItem() {
    }

    public InvoiceItem(Integer invoiceId, Integer lineNo, ItemType itemType, String description,
                       BigDecimal quantity, BigDecimal unitPrice) {
        this.invoiceId = invoiceId;
        this.lineNo = lineNo;
        this.itemType = itemType;
        this.description = description.length() > 150 ? description.substring(0, 150) : description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    /** Same formula as the generated column, so it is right even before the row is re-read. */
    public BigDecimal amount() {
        return lineAmount != null ? lineAmount : quantity.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);
    }

    public Integer getInvoiceId() { return invoiceId; }
    public Integer getLineNo() { return lineNo; }
    public ItemType getItemType() { return itemType; }
    public String getDescription() { return description; }
    public BigDecimal getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}
