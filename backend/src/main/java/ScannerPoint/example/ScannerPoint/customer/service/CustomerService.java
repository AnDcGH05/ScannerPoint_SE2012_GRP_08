package ScannerPoint.example.ScannerPoint.customer.service;

import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.customer.dto.CustomerResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.CustomerUpdateRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.PhoneDto;
import ScannerPoint.example.ScannerPoint.customer.dto.VehicleResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.WalkInRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.WalkInResponse;
import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.entity.CustomerPhone;
import ScannerPoint.example.ScannerPoint.customer.repository.CustomerRepository;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository;
import ScannerPoint.example.ScannerPoint.user.repository.UserAccountRepository;
import ScannerPoint.example.ScannerPoint.user.service.AccountFactory;
import ScannerPoint.example.ScannerPoint.user.service.AuthService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final UserAccountRepository userAccountRepository;
    private final AccountFactory accountFactory;
    private final AuthService authService;
    private final VehicleService vehicleService;

    public CustomerService(CustomerRepository customerRepository, VehicleRepository vehicleRepository,
                           UserAccountRepository userAccountRepository, AccountFactory accountFactory,
                           AuthService authService, VehicleService vehicleService) {
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.userAccountRepository = userAccountRepository;
        this.accountFactory = accountFactory;
        this.authService = authService;
        this.vehicleService = vehicleService;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> list(String q) {
        List<Customer> customers = (q == null || q.isBlank())
                ? customerRepository.findAllByOrderByLastNameAscFirstNameAsc()
                : customerRepository.findAllById(customerRepository.searchIds(q.trim()));
        return customers.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse get(Integer id) {
        return toResponse(find(id));
    }

    /** Customers edit only themselves (nic stays as registered); staff may also correct the NIC. */
    @Transactional
    public CustomerResponse update(Integer id, CustomerUpdateRequest r, boolean staff) {
        Customer c = find(id);
        String email = r.email().trim().toLowerCase();
        if (!c.getEmail().equalsIgnoreCase(email) && userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this e-mail already exists");
        }
        if (staff && r.nic() != null && !r.nic().isBlank() && !c.getNic().equalsIgnoreCase(r.nic().trim())) {
            if (customerRepository.existsByNicIgnoreCase(r.nic().trim())) {
                throw new ConflictException("A customer with this NIC is already registered");
            }
            c.setNic(r.nic().trim().toUpperCase());
        }
        c.setFirstName(r.firstName().trim());
        c.setLastName(r.lastName().trim());
        c.setEmail(email);
        c.setStreet(r.street().trim());
        c.setCity(r.city().trim());
        c.setPostalCode(r.postalCode() == null || r.postalCode().isBlank() ? null : r.postalCode().trim());
        Set<CustomerPhone> phones = new LinkedHashSet<>();
        for (PhoneDto p : r.phones()) {
            phones.add(new CustomerPhone(p.phoneNo(), p.phoneType()));
        }
        c.getPhones().clear();
        c.getPhones().addAll(phones);
        customerRepository.saveAndFlush(c);
        return toResponse(c);
    }

    /** Soft delete: the customer can no longer log in, but bookings and bills stay. */
    @Transactional
    public CustomerResponse setActive(Integer id, boolean active) {
        Customer c = find(id);
        c.setActive(active);
        return toResponse(c);
    }

    /** Receptionist registers a walk-in customer and, optionally, their first vehicle. */
    @Transactional
    public WalkInResponse registerWalkIn(WalkInRequest r) {
        String username = r.email().trim().toLowerCase();
        authService.checkUnique(username, r.email(), r.nic());
        String tempPassword = accountFactory.newTemporaryPassword();
        Customer c = accountFactory.createWalkIn(r.firstName(), r.lastName(), r.nic(), r.email(), r.mobile(),
                r.street(), r.city(), r.postalCode(), tempPassword);
        customerRepository.saveAndFlush(c);
        VehicleResponse vehicle = null;
        if (r.vehicle() != null) {
            vehicle = vehicleService.createFor(c, r.vehicle());
        }
        return new WalkInResponse(toResponse(c), vehicle, c.getUsername(), tempPassword);
    }

    public Customer find(Integer id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Customer not found with id: " + id));
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.from(c, vehicleRepository.countByCustomer_Id(c.getId()));
    }
}
