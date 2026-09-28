package ScannerPoint.example.ScannerPoint.customer.service;

import ScannerPoint.example.ScannerPoint.customer.dto.CustomerRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.CustomerResponse;
import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = new Customer(request.getName(), request.getEmail(), request.getPhone(), request.getAddress());
        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress()
        );
    }
}