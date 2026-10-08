package ScannerPoint.example.ScannerPoint.customer.dto;

import ScannerPoint.example.ScannerPoint.customer.entity.Customer;

import java.time.LocalDate;
import java.util.List;

public record CustomerResponse(
        Integer id,
        String firstName,
        String lastName,
        String fullName,
        String nic,
        String email,
        String username,
        String street,
        String city,
        String postalCode,
        LocalDate registeredDate,
        List<PhoneDto> phones,
        long vehicleCount,
        boolean active) {

    public static CustomerResponse from(Customer c, long vehicleCount) {
        return new CustomerResponse(c.getId(), c.getFirstName(), c.getLastName(), c.getFullName(), c.getNic(),
                c.getEmail(), c.getUsername(), c.getStreet(), c.getCity(), c.getPostalCode(), c.getRegisteredDate(),
                c.getPhones().stream().map(PhoneDto::from).toList(), vehicleCount, Boolean.TRUE.equals(c.getActive()));
    }
}
