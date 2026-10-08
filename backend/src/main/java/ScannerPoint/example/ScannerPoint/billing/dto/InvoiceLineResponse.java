package ScannerPoint.example.ScannerPoint.billing.dto;

import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceItem;
import ScannerPoint.example.ScannerPoint.billing.entity.ItemType;

import java.math.BigDecimal;

public record InvoiceLineResponse(
        Integer lineNo,
        ItemType itemType,
        String description,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal lineAmount) {

    public static InvoiceLineResponse from(InvoiceItem i) {
        return new InvoiceLineResponse(i.getLineNo(), i.getItemType(), i.getDescription(), i.getQuantity(),
                i.getUnitPrice(), i.amount());
    }
}
