package ScannerPoint.example.ScannerPoint.customer.controller;

import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.dto.ServiceDueResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.ServiceHistoryResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.VehicleRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.VehicleResponse;
import ScannerPoint.example.ScannerPoint.customer.service.ReminderService;
import ScannerPoint.example.ScannerPoint.customer.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final ReminderService reminderService;
    private final CurrentUser currentUser;

    public VehicleController(VehicleService vehicleService, ReminderService reminderService, CurrentUser currentUser) {
        this.vehicleService = vehicleService;
        this.reminderService = reminderService;
        this.currentUser = currentUser;
    }

    /** Customers get their own vehicles; staff pass ?customerId=. */
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public List<VehicleResponse> list(@RequestParam(required = false) Integer customerId) {
        if (currentUser.isCustomer()) {
            return vehicleService.listForCustomer(currentUser.id());
        }
        if (customerId == null) {
            throw new BadRequestException("customerId is required");
        }
        return vehicleService.listForCustomer(customerId);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public List<VehicleResponse> search(@RequestParam String plate) {
        return vehicleService.searchByPlate(plate);
    }

    /** Predictive maintenance: vehicles due for a service (customers see their own). */
    @GetMapping("/service-due")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public List<ServiceDueResponse> serviceDue() {
        return vehicleService.serviceDue();
    }

    /** Admin "send reminders now" button (the same job also runs every morning). */
    @PostMapping("/service-due/remind")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Integer> sendReminders() {
        return Map.of("remindersSent", reminderService.sendReminders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public VehicleResponse get(@PathVariable Integer id) {
        return vehicleService.get(id);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public List<ServiceHistoryResponse> history(@PathVariable Integer id) {
        return vehicleService.history(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleResponse create(@Valid @RequestBody VehicleRequest request) {
        return vehicleService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public VehicleResponse update(@PathVariable Integer id, @Valid @RequestBody VehicleRequest request) {
        return vehicleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        vehicleService.delete(id);
    }
}
