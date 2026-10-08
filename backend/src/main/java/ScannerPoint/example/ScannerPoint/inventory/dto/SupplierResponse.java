package ScannerPoint.example.ScannerPoint.inventory.dto;

import ScannerPoint.example.ScannerPoint.inventory.entity.Supplier;

import java.util.List;

/** Supplier card: company, contact person, phone, e-mail, city and parts supplied. */
public record SupplierResponse(
        Integer id,
        String name,
        String contactPerson,
        String phoneNo,
        String email,
        String city,
        List<String> partsSupplied) {

    public static SupplierResponse from(Supplier s, List<String> parts) {
        return new SupplierResponse(s.getId(), s.getName(), s.getContactPerson(), s.getPhoneNo(), s.getEmail(),
                s.getCity(), parts);
    }
}
