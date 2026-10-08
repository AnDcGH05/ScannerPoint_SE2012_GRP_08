package ScannerPoint.example.ScannerPoint.billing.entity;

import java.io.Serializable;
import java.util.Objects;

/** Composite key of INVOICE_ITEM: (invoice_id, line_no). */
public class InvoiceItemId implements Serializable {

    private Integer invoiceId;
    private Integer lineNo;

    public InvoiceItemId() {
    }

    public InvoiceItemId(Integer invoiceId, Integer lineNo) {
        this.invoiceId = invoiceId;
        this.lineNo = lineNo;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof InvoiceItemId other
                && Objects.equals(invoiceId, other.invoiceId) && Objects.equals(lineNo, other.lineNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(invoiceId, lineNo);
    }
}
