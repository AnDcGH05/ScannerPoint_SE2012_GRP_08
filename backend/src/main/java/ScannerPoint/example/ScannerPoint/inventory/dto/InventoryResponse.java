package ScannerPoint.example.ScannerPoint.inventory.dto;

import java.time.LocalDateTime;

public class InventoryResponse {

    private Long transactionId;
    private String partName;
    private String transactionType; // RESTOCK, DISPENSE, ADJUSTMENT
    private Integer quantity;
    private LocalDateTime transactionDate;
    private String notes;

    public InventoryResponse(Long transactionId, String partName, String transactionType,
                             Integer quantity, LocalDateTime transactionDate, String notes) {
        this.transactionId = transactionId;
        this.partName = partName;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.transactionDate = transactionDate;
        this.notes = notes;
    }

    public Long getTransactionId() { return transactionId; }
    public String getPartName() { return partName; }
    public String getTransactionType() { return transactionType; }
    public Integer getQuantity() { return quantity; }
    public LocalDateTime getTransactionDate() { return transactionDate; }
    public String getNotes() { return notes; }
}