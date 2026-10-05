package ScannerPoint.example.ScannerPoint.repair.service;

import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.repository.CustomerRepository;
import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository;
import ScannerPoint.example.ScannerPoint.repair.dto.AppointmentRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.AppointmentResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.Appointment;
import ScannerPoint.example.ScannerPoint.repair.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              CustomerRepository customerRepository,
                              VehicleRepository vehicleRepository) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new NotFoundException("Customer not found with id: " + request.getCustomerId()));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        Appointment appointment = new Appointment(
                customer,
                vehicle,
                request.getAppointmentDate(),
                request.getServiceType(),
                request.getNotes()
        );

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse updateStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Appointment not found with id: " + id));

        appointment.setStatus(status.toUpperCase());
        Appointment updated = appointmentRepository.save(appointment);
        return mapToResponse(updated);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getCustomer().getId(),
                appointment.getCustomer().getName(),
                appointment.getVehicle().getId(),
                appointment.getVehicle().getLicensePlate(),
                appointment.getAppointmentDate(),
                appointment.getServiceType(),
                appointment.getStatus(),
                appointment.getNotes()
        );
    }
}