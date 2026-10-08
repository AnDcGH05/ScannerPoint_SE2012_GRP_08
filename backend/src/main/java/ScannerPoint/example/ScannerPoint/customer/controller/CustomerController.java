package ScannerPoint.example.ScannerPoint.customer.controller;

import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.dto.CustomerResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.CustomerUpdateRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.WalkInRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.WalkInResponse;
import ScannerPoint.example.ScannerPoint.customer.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final CurrentUser currentUser;

    public CustomerController(CustomerService customerService, CurrentUser currentUser) {
        this.customerService = customerService;
        this.currentUser = currentUser;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public CustomerResponse me() {
        return customerService.get(currentUser.id());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public CustomerResponse updateMe(@Valid @RequestBody CustomerUpdateRequest request) {
        return customerService.update(currentUser.id(), request, false);
    }

    /** Search by name, phone, NIC or number plate (?q=). */
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public List<CustomerResponse> list(@RequestParam(required = false) String q) {
        return customerService.list(q);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public CustomerResponse get(@PathVariable Integer id) {
        return customerService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public WalkInResponse registerWalkIn(@Valid @RequestBody WalkInRequest request) {
        return customerService.registerWalkIn(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public CustomerResponse update(@PathVariable Integer id, @Valid @RequestBody CustomerUpdateRequest request) {
        return customerService.update(id, request, true);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public CustomerResponse deactivate(@PathVariable Integer id) {
        return customerService.setActive(id, false);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public CustomerResponse activate(@PathVariable Integer id) {
        return customerService.setActive(id, true);
    }
}
