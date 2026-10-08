package ScannerPoint.example.ScannerPoint.customer.service;

import ScannerPoint.example.ScannerPoint.customer.dto.ServiceDueResponse;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.NotifType;
import ScannerPoint.example.ScannerPoint.repair.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Predictive maintenance: every morning (app.reminders.cron, default 08:00) find the
 * vehicles due for a service (6 months or 5,000 km, query 1.3) and remind the owner,
 * at most once every 30 days.
 */
@Service
public class ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);

    private final VehicleRepository vehicleRepository;
    private final NotificationService notificationService;

    public ReminderService(VehicleRepository vehicleRepository, NotificationService notificationService) {
        this.vehicleRepository = vehicleRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "${app.reminders.cron:0 0 8 * * *}")
    public void dailyReminders() {
        int sent = sendReminders();
        log.info("Service reminders sent: {}", sent);
    }

    /** @return how many reminders were sent (also used by the admin "Run now" button) */
    @Transactional
    public int sendReminders() {
        LocalDateTime cutOff = LocalDateTime.now().minusDays(30);
        List<ServiceDueResponse> due = vehicleRepository.dueForService(null).stream()
                .map(ServiceDueResponse::from).toList();
        int sent = 0;
        for (ServiceDueResponse v : due) {
            if (v.lastReminderSent() == null || v.lastReminderSent().isBefore(cutOff)) {
                notificationService.notifyCustomer(v.customerId(), NotifType.SERVICE_REMINDER,
                        v.message() + ". Book online at ScannerPoint.");
                sent++;
            }
        }
        return sent;
    }
}
