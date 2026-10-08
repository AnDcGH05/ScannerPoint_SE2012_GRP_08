package ScannerPoint.example.ScannerPoint.billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceSummary;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Read-only report queries 4.2 – 4.5 (native SQL over the view and tables). */
public interface BillingReportRepository extends Repository<InvoiceSummary, Integer> {

    /** Query 4.2 – outstanding bills. */
    @Query(value = """
            SELECT  s.invoice_id                              AS invoiceId,
                    s.invoice_no                              AS invoiceNo,
                    s.job_card_id                             AS jobCardId,
                    CONCAT(c.first_name, ' ', c.last_name)    AS customer,
                    v.registration_no                         AS registrationNo,
                    s.total                                   AS total,
                    s.deposit_paid                            AS depositPaid,
                    s.amount_paid                             AS amountPaid,
                    s.balance_due                             AS balanceDue,
                    DATEDIFF(CURDATE(), s.invoice_date)       AS daysOutstanding
            FROM    v_invoice_summary s
            JOIN    job_card j  ON j.job_card_id = s.job_card_id
            JOIN    vehicle v   ON v.vehicle_id = j.vehicle_id
            JOIN    customer c  ON c.customer_id = v.customer_id
            WHERE   s.status NOT IN ('CANCELLED', 'DRAFT')
              AND   s.balance_due > 0
            ORDER BY daysOutstanding DESC""", nativeQuery = true)
    List<OutstandingRow> outstanding();

    /** Query 4.3 – payment slips waiting to be checked, with the amount expected. */
    @Query(value = """
            SELECT  p.payment_id                                                  AS paymentId,
                    CASE WHEN p.payment_type = 'DEPOSIT' THEN a.deposit_amount
                         ELSE s.balance_due END                                    AS amountExpected
            FROM    payment p
            LEFT JOIN appointment a       ON a.appointment_id = p.appointment_id
            LEFT JOIN v_invoice_summary s ON s.invoice_id = p.invoice_id
            WHERE   p.status = 'PENDING'""", nativeQuery = true)
    List<ExpectedRow> expectedAmounts();

    /** Query 4.4 – bookings, cancellations, amount billed and average rating per package. */
    @Query(value = """
            SELECT  st.service_type_id                                                    AS packageId,
                    st.service_name                                                       AS packageName,
                    st.pricing_type                                                       AS pricingType,
                    st.base_price                                                         AS basePrice,
                    (SELECT COUNT(*) FROM appointment a
                      WHERE a.service_type_id = st.service_type_id AND a.status <> 'CANCELLED')  AS bookings,
                    (SELECT COUNT(*) FROM appointment a
                      WHERE a.service_type_id = st.service_type_id AND a.status = 'CANCELLED')   AS cancelled,
                    (SELECT COALESCE(SUM(s.total), 0) FROM v_invoice_summary s
                       JOIN job_card j    ON j.job_card_id = s.job_card_id
                       JOIN appointment a ON a.appointment_id = j.appointment_id
                      WHERE a.service_type_id = st.service_type_id AND s.status <> 'CANCELLED')  AS totalBilled,
                    (SELECT ROUND(AVG(f.rating), 2) FROM feedback f
                       JOIN job_card j    ON j.job_card_id = f.job_card_id
                       JOIN appointment a ON a.appointment_id = j.appointment_id
                      WHERE a.service_type_id = st.service_type_id)                       AS avgRating
            FROM    service_type st
            ORDER BY totalBilled DESC""", nativeQuery = true)
    List<PackageRow> packagePerformance();

    /** Query 4.5 – cancellations with penalty and refund (24-hour rule). */
    @Query(value = """
            SELECT  r.refund_id                              AS refundId,
                    a.appointment_id                         AS appointmentId,
                    CONCAT(c.first_name, ' ', c.last_name)   AS customer,
                    st.service_name                          AS packageName,
                    a.scheduled_at                           AS scheduledAt,
                    a.cancelled_at                           AS cancelledAt,
                    r.notice_hours                           AS noticeHours,
                    r.deposit_paid                           AS depositPaid,
                    r.penalty_amount                         AS penaltyAmount,
                    r.refund_amount                          AS refundAmount,
                    r.status                                 AS refundStatus
            FROM    refund r
            JOIN    appointment a   ON a.appointment_id = r.appointment_id
            JOIN    customer c      ON c.customer_id = a.customer_id
            JOIN    service_type st ON st.service_type_id = a.service_type_id
            ORDER BY a.cancelled_at DESC""", nativeQuery = true)
    List<CancellationRow> cancellations();

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM payment WHERE status = 'VERIFIED'", nativeQuery = true)
    BigDecimal totalVerified();

    @Query(value = "SELECT COUNT(*) FROM payment WHERE status = 'PENDING'", nativeQuery = true)
    long pendingSlips();

    @Query(value = "SELECT COUNT(*) FROM refund WHERE status = 'PENDING'", nativeQuery = true)
    long pendingRefunds();

    @Query(value = "SELECT ROUND(AVG(rating), 2) FROM feedback", nativeQuery = true)
    BigDecimal averageRating();

    interface OutstandingRow {
        Integer getInvoiceId();
        String getInvoiceNo();
        Integer getJobCardId();
        String getCustomer();
        String getRegistrationNo();
        BigDecimal getTotal();
        BigDecimal getDepositPaid();
        BigDecimal getAmountPaid();
        BigDecimal getBalanceDue();
        Long getDaysOutstanding();
    }

    interface ExpectedRow {
        Integer getPaymentId();
        BigDecimal getAmountExpected();
    }

    interface PackageRow {
        Integer getPackageId();
        String getPackageName();
        String getPricingType();
        BigDecimal getBasePrice();
        Long getBookings();
        Long getCancelled();
        BigDecimal getTotalBilled();
        BigDecimal getAvgRating();
    }

    interface CancellationRow {
        Integer getRefundId();
        Integer getAppointmentId();
        String getCustomer();
        String getPackageName();
        LocalDateTime getScheduledAt();
        LocalDateTime getCancelledAt();
        Integer getNoticeHours();
        BigDecimal getDepositPaid();
        BigDecimal getPenaltyAmount();
        BigDecimal getRefundAmount();
        String getRefundStatus();
    }
}
