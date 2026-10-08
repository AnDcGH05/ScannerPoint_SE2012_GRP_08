package ScannerPoint.example.ScannerPoint.billing.dto;

import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Printable bill (Stitch W3). Totals come from the v_invoice_summary view. */
public record InvoiceResponse(
        Integer id,
        String invoiceNo,
        Integer jobCardId,
        Integer customerId,
        String customerName,
        String vehicleName,
        String packageName,
        LocalDate invoiceDate,
        LocalDate warrantyUntil,
        InvoiceStatus status,
        String issuedByName,
        List<InvoiceLineResponse> lines,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal taxRate,
        BigDecimal taxAmount,
        BigDecimal total,
        BigDecimal depositPaid,
        BigDecimal amountPaid,
        BigDecimal balanceDue) {
}
