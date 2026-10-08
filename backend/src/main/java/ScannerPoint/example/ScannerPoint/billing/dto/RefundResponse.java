package ScannerPoint.example.ScannerPoint.billing.dto;

import ScannerPoint.example.ScannerPoint.billing.entity.Refund;
import ScannerPoint.example.ScannerPoint.billing.entity.RefundStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RefundResponse(
        Integer id,
        Integer appointmentId,
        String customerName,
        String packageName,
        LocalDateTime scheduledAt,
        LocalDateTime cancelledAt,
        Integer noticeHours,
        BigDecimal depositPaid,
        BigDecimal penaltyAmount,
        BigDecimal refundAmount,
        RefundStatus status,
        String processedByName,
        LocalDateTime processedAt,
        String bankReference) {

    public static RefundResponse from(Refund r) {
        var a = r.getAppointment();
        return new RefundResponse(r.getId(), a.getId(), a.getCustomer().getFullName(), a.getServiceType().getName(),
                a.getScheduledAt(), a.getCancelledAt(), r.getNoticeHours(), r.getDepositPaid(), r.getPenaltyAmount(),
                r.getRefundAmount(), r.getStatus(),
                r.getProcessedBy() == null ? null : r.getProcessedBy().getFullName(),
                r.getProcessedAt(), r.getBankReference());
    }
}
