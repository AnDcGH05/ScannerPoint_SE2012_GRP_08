package ScannerPoint.example.ScannerPoint.inventory.entity;

/** OPENING, RECEIPT and RETURN add stock; ISSUE removes it; ADJUSTMENT can do either. */
public enum TxnType {
    OPENING, RECEIPT, ISSUE, RETURN, ADJUSTMENT
}
