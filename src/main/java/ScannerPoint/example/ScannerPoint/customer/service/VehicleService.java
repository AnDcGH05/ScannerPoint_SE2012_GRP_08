package ScannerPoint.example.ScannerPoint.customer.service;

import ScannerPoint.example.ScannerPoint.customer.dto.VehicleRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.VehicleResponse;
import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import ScannerPoint.example.ScannerPoint.customer.repository.CustomerRepository;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    public VehicleService(VehicleRepository vehicleRepository, CustomerRepository customerRepository) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
    }

    public VehicleResponse createVehicle(VehicleRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Vehicle vehicle = new Vehicle(request.getLicensePlate(), request.getMake(), request.getModel(), customer);
        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToResponse(saved);
    }

    public List<VehicleResponse> getVehiclesByCustomer(Long customerId) {
        return vehicleRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getLicensePlate(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getCustomer().getId(),
                vehicle.getCustomer().getName()
        );
    }
}