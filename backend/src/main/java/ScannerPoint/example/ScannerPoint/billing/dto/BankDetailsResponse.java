package ScannerPoint.example.ScannerPoint.billing.dto;

/** "Pay by bank transfer" card. Values come from app.bank.* in the configuration. */
public record BankDetailsResponse(
        String bankName,
        String branch,
        String accountName,
        String accountNo) {
}
