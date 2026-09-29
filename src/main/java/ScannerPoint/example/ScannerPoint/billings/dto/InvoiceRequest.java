package ScannerPoint.example.ScannerPoint.billing.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class InvoiceRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long jobCardId;

    @NotEmpty(message = "Invoice must contain at least one item")
    private List<ItemRequest> items;

    public InvoiceRequest() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getJobCardId() { return jobCardId; }
    public void setJobCardId(Long jobCardId) { this.jobCardId = jobCardId; }
    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }

    public static class ItemRequest {
        @NotNull
        private String description;
        @NotNull
        private Double amount;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
    }
}