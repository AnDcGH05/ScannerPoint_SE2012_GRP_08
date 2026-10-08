package ScannerPoint.example.ScannerPoint.billing.pricing;

import ScannerPoint.example.ScannerPoint.billing.entity.ItemType;

import java.math.BigDecimal;

/** A bill line worked out by a pricing strategy, before it is saved as an INVOICE_ITEM. */
public record BillLine(ItemType itemType, String description, BigDecimal quantity, BigDecimal unitPrice) {
}
