package ScannerPoint.example.ScannerPoint.customer.dto;

/** The temporary password is shown once so the receptionist can give it to the customer. */
public record WalkInResponse(
        CustomerResponse customer,
        VehicleResponse vehicle,
        String username,
        String temporaryPassword) {
}
