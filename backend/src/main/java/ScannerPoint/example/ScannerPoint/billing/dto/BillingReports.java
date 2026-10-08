package ScannerPoint.example.ScannerPoint.billing.dto;

import ScannerPoint.example.ScannerPoint.billing.repository.BillingReportRepository.CancellationRow;
import ScannerPoint.example.ScannerPoint.billing.repository.BillingReportRepository.OutstandingRow;
import ScannerPoint.example.ScannerPoint.billing.repository.BillingReportRepository.PackageRow;
import ScannerPoint.example.ScannerPoint.billing.repository.PaymentRepository.WeeklyPaymentsRow;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Rows for the admin reports dashboard (Stitch W6). */
public final class BillingReports {

    private BillingReports() {
    }

    /** Query 4.2 – "Outstanding bills" table. */
    public record OutstandingBill(Integer invoiceId, String invoiceNo, Integer jobCardId, String customer,
                                  String registrationNo, BigDecimal total, BigDecimal depositPaid,
                                  BigDecimal amountPaid, BigDecimal balanceDue, long daysOutstanding) {
        public static OutstandingBill from(OutstandingRow r) {
            return new OutstandingBill(r.getInvoiceId(), r.getInvoiceNo(), r.getJobCardId(), r.getCustomer(),
                    r.getRegistrationNo(), r.getTotal(), r.getDepositPaid(), r.getAmountPaid(), r.getBalanceDue(),
                    r.getDaysOutstanding() == null ? 0 : r.getDaysOutstanding());
        }
    }

    /** Query 4.4 – "Amount billed per package", bookings vs cancellations, average rating. */
    public record PackagePerformance(Integer packageId, String packageName, String pricingType, BigDecimal basePrice,
                                     long bookings, long cancelled, BigDecimal totalBilled, BigDecimal avgRating) {
        public static PackagePerformance from(PackageRow r) {
            return new PackagePerformance(r.getPackageId(), r.getPackageName(), r.getPricingType(), r.getBasePrice(),
                    r.getBookings() == null ? 0 : r.getBookings(), r.getCancelled() == null ? 0 : r.getCancelled(),
                    r.getTotalBilled(), r.getAvgRating());
        }
    }

    /** Query 4.5 – cancellations with penalty and refund. */
    public record Cancellation(Integer refundId, Integer appointmentId, String customer, String packageName,
                               LocalDateTime scheduledAt, LocalDateTime cancelledAt, Integer noticeHours,
                               BigDecimal depositPaid, BigDecimal penaltyAmount, BigDecimal refundAmount,
                               String refundStatus) {
        public static Cancellation from(CancellationRow r) {
            return new Cancellation(r.getRefundId(), r.getAppointmentId(), r.getCustomer(), r.getPackageName(),
                    r.getScheduledAt(), r.getCancelledAt(), r.getNoticeHours(), r.getDepositPaid(),
                    r.getPenaltyAmount(), r.getRefundAmount(), r.getRefundStatus());
        }
    }

    /** "Payments verified per week" line chart. */
    public record WeeklyPayments(LocalDate weekStart, long payments, BigDecimal amount) {
        public static WeeklyPayments from(WeeklyPaymentsRow r) {
            return new WeeklyPayments(r.getWeekStart(), r.getPayments() == null ? 0 : r.getPayments(), r.getAmount());
        }
    }
}
