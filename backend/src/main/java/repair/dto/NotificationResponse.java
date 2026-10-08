package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.entity.Channel;
import ScannerPoint.example.ScannerPoint.repair.entity.DeliveryStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.NotifType;
import ScannerPoint.example.ScannerPoint.repair.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Integer id,
        NotifType type,
        Channel channel,
        String message,
        LocalDateTime sentAt,
        DeliveryStatus deliveryStatus) {

    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getChannel(), n.getMessage(),
                n.getSentAt(), n.getDeliveryStatus());
    }
}
