package ScannerPoint.example.ScannerPoint.billing.dto;

public class ReportResponse {
    private Double totalRevenue;
    private Long totalInvoices;
    private Long pendingInvoices;

    public ReportResponse(Double totalRevenue, Long totalInvoices, Long pendingInvoices) {
        this.totalRevenue = totalRevenue;
        this.totalInvoices = totalInvoices;
        this.pendingInvoices = pendingInvoices;
    }

    public Double getTotalRevenue() { return totalRevenue; }
    public Long getTotalInvoices() { return totalInvoices; }
    public Long getPendingInvoices() { return pendingInvoices; }
}