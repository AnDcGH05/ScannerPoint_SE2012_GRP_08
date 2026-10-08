package ScannerPoint.example.ScannerPoint.user.service;

import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.entity.CustomerPhone;
import ScannerPoint.example.ScannerPoint.customer.entity.PhoneType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDate;

/**
 * Factory pattern: one place that knows how to build a correct customer account,
 * whether the customer signs up online or the receptionist registers a walk-in.
 * Callers never set user_type, the BCrypt hash or the registration date themselves.
 */
@Component
public class AccountFactory {

    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private final SecureRandom random = new SecureRandom();
    private final PasswordEncoder passwordEncoder;

    public AccountFactory(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /** Online sign-up: the customer chooses the username and password. */
    public Customer createCustomer(String firstName, String lastName, String nic, String email, String mobile,
                                   String street, String city, String postalCode,
                                   String username, String rawPassword) {
        Customer c = new Customer();
        c.setFirstName(firstName.trim());
        c.setLastName(lastName.trim());
        c.setNic(nic.trim().toUpperCase());
        c.setEmail(email.trim().toLowerCase());
        c.setStreet(street.trim());
        c.setCity(city.trim());
        c.setPostalCode(blankToNull(postalCode));
        c.setRegisteredDate(LocalDate.now());
        c.setUsername(username.trim());
        c.setPasswordHash(passwordEncoder.encode(rawPassword));
        c.setActive(true);
        c.getPhones().add(new CustomerPhone(mobile.trim(), PhoneType.MOBILE));
        return c;
    }

    /**
     * Walk-in registered by the receptionist: the username is taken from the e-mail
     * and a temporary password is generated (returned once so it can be given to the customer).
     */
    public Customer createWalkIn(String firstName, String lastName, String nic, String email, String mobile,
                                 String street, String city, String postalCode, String temporaryPassword) {
        String username = email.trim().toLowerCase();
        return createCustomer(firstName, lastName, nic, email, mobile, street, city, postalCode,
                username.length() > 50 ? username.substring(0, 50) : username, temporaryPassword);
    }

    public String newTemporaryPassword() {
        StringBuilder sb = new StringBuilder("Sp-");
        for (int i = 0; i < 8; i++) {
            sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
