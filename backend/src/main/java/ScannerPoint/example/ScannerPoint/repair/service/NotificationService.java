package ScannerPoint.example.ScannerPoint.repair.service;

import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.repository.CustomerRepository;
import ScannerPoint.example.ScannerPoint.repair.dto.NotificationResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.Channel;
import ScannerPoint.example.ScannerPoint.repair.entity.DeliveryStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.NotifType;
import ScannerPoint.example.ScannerPoint.repair.entity.Notification;
import ScannerPoint.example.ScannerPoint.repair.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Sends booking confirmations, approval requests, "vehicle ready", receipts and
 * service reminders. E-mail goes through JavaMailSender when spring.mail.host is set
 * (otherwise it is only logged); SMS is a console stub. Every attempt is saved in the
 * NOTIFICATION table as SENT or FAILED. A failed notification never breaks the action
 * that caused it.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;
    private final ObjectProvider<JavaMailSender> mailSender;
    private final String from;

    public NotificationService(NotificationRepository notificationRepository,
                               CustomerRepository customerRepository,
                               ObjectProvider<JavaMailSender> mailSender,
                               @Value("${app.mail.from:noreply@scannerpoint.lk}") String from) {
        this.notificationRepository = notificationRepository;
        this.customerRepository = customerRepository;
        this.mailSender = mailSender;
        this.from = from;
    }

    /** Sends the message by e-mail and by SMS. */
    @Transactional
    public void notifyCustomer(Integer customerId, NotifType type, String message) {
        send(customerId, type, Channel.EMAIL, message);
        send(customerId, type, Channel.SMS, message);
    }

    @Transactional
    public Notification send(Integer customerId, NotifType type, Channel channel, String message) {
        String text = message.length() > 255 ? message.substring(0, 252) + "..." : message;
        DeliveryStatus status;
        try {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer == null) {
                status = DeliveryStatus.FAILED;
            } else if (channel == Channel.EMAIL) {
                status = sendEmail(customer.getEmail(), type, text);
            } else {
                String mobile = customer.getMobile();
                log.info("[SMS stub] to {}: {}", mobile, text);
                status = (mobile == null) ? DeliveryStatus.FAILED : DeliveryStatus.SENT;
            }
        } catch (RuntimeException e) {
            log.warn("Notification to customer {} failed: {}", customerId, e.getMessage());
            status = DeliveryStatus.FAILED;
        }
        return notificationRepository.save(new Notification(customerId, type, channel, text, status));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> forCustomer(Integer customerId) {
        return notificationRepository.findTop30ByCustomerIdOrderBySentAtDesc(customerId).stream()
                .map(NotificationResponse::from).toList();
    }

    private DeliveryStatus sendEmail(String to, NotifType type, String text) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.info("[E-mail not configured] to {}: {}", to, text);
            return DeliveryStatus.SENT;
        }
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(from);
            mail.setTo(to);
            mail.setSubject("ScannerPoint - " + type.name().replace('_', ' ').toLowerCase());
            mail.setText(text);
            sender.send(mail);
            return DeliveryStatus.SENT;
        } catch (RuntimeException e) {
            log.warn("E-mail to {} failed: {}", to, e.getMessage());
            return DeliveryStatus.FAILED;
        }
    }
}
