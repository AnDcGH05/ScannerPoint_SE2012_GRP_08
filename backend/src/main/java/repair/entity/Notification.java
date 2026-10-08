package ScannerPoint.example.ScannerPoint.repair.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/** Every e-mail / SMS sent to a customer, with whether it was delivered. */
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer id;

    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "notif_type", nullable = false)
    private NotifType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Channel channel;

    @Column(nullable = false, length = 255)
    private String message;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false)
    private DeliveryStatus deliveryStatus = DeliveryStatus.SENT;

    protected Notification() {
    }

    public Notification(Integer customerId, NotifType type, Channel channel, String message, DeliveryStatus status) {
        this.customerId = customerId;
        this.type = type;
        this.channel = channel;
        this.message = message;
        this.deliveryStatus = status;
    }

    public Integer getId() { return id; }
    public Integer getCustomerId() { return customerId; }
    public NotifType getType() { return type; }
    public Channel getChannel() { return channel; }
    public String getMessage() { return message; }
    public LocalDateTime getSentAt() { return sentAt; }
    public DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
}
