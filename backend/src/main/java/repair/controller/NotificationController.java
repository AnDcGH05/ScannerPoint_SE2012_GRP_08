package ScannerPoint.example.ScannerPoint.repair.controller;

import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.repair.dto.NotificationResponse;
import ScannerPoint.example.ScannerPoint.repair.service.NotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUser currentUser;

    public NotificationController(NotificationService notificationService, CurrentUser currentUser) {
        this.notificationService = notificationService;
        this.currentUser = currentUser;
    }

    /** "Recent notifications" on the customer dashboard. */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<NotificationResponse> mine() {
        return notificationService.forCustomer(currentUser.id());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public List<NotificationResponse> forCustomer(@RequestParam Integer customerId) {
        return notificationService.forCustomer(customerId);
    }
}
