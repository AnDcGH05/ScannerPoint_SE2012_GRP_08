package ScannerPoint.example.ScannerPoint.customer.controller;

import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.dto.AppointmentResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.BookingRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.CancelPreviewResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.CancelResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.RescheduleRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.SlotResponse;
import ScannerPoint.example.ScannerPoint.customer.entity.AppointmentStatus;
import ScannerPoint.example.ScannerPoint.customer.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final CurrentUser currentUser;

    public AppointmentController(AppointmentService appointmentService, CurrentUser currentUser) {
        this.appointmentService = appointmentService;
        this.currentUser = currentUser;
    }

    @GetMapping("/slots")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public List<SlotResponse> slots(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentService.freeSlots(date);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST')")
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse book(@Valid @RequestBody BookingRequest request) {
        return appointmentService.book(request);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<AppointmentResponse> mine() {
        return appointmentService.mine();
    }

    /**
     * Calendar: ?date=2026-10-03, or a week with ?from=&to=. Optional &status=CONFIRMED
     * (e.g. today's confirmed bookings for the check-in modal), or ?customerId= for one customer.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public List<AppointmentResponse> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) Integer customerId) {
        if (customerId != null) {
            return appointmentService.forCustomer(customerId);
        }
        LocalDate start = from != null ? from : (date != null ? date : LocalDate.now());
        LocalDate end = to != null ? to : start;
        return appointmentService.between(start, end, status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public AppointmentResponse get(@PathVariable Integer id) {
        return appointmentService.get(id);
    }

    /** Disabled in the UI until the deposit badge is VERIFIED; the DB trigger also refuses it. */
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public AppointmentResponse confirm(@PathVariable Integer id) {
        return appointmentService.confirm(id, currentUser.id());
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST')")
    public AppointmentResponse reschedule(@PathVariable Integer id, @Valid @RequestBody RescheduleRequest request) {
        return appointmentService.reschedule(id, request);
    }

    @PatchMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public AppointmentResponse noShow(@PathVariable Integer id) {
        return appointmentService.markNoShow(id);
    }

    @GetMapping("/{id}/cancel-preview")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public CancelPreviewResponse cancelPreview(@PathVariable Integer id) {
        return appointmentService.cancelPreview(id);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public CancelResponse cancel(@PathVariable Integer id) {
        return appointmentService.cancel(id);
    }
}
