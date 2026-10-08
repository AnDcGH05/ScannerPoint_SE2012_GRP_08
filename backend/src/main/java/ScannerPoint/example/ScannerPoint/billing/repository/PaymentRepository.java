package ScannerPoint.example.ScannerPoint.billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.Payment;
import ScannerPoint.example.ScannerPoint.billing.entity.PaymentStatus;
import ScannerPoint.example.ScannerPoint.billing.entity.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    List<Payment> findByStatusOrderByUploadedAtAsc(PaymentStatus status);

    List<Payment> findByAppointment_IdOrderByUploadedAtDesc(Integer appointmentId);

    List<Payment> findByInvoice_IdOrderByUploadedAtDesc(Integer invoiceId);

    boolean existsByAppointment_IdAndStatus(Integer appointmentId, PaymentStatus status);

    boolean existsByInvoice_IdAndStatus(Integer invoiceId, PaymentStatus status);

    /** All slips a customer uploaded, deposits and final payments. */
    @Query("""
            select p from Payment p
            left join p.appointment a
            left join p.invoice i
            where a.customer.id = :customerId or i.jobCard.vehicle.customer.id = :customerId
            order by p.uploadedAt desc""")
    List<Payment> findForCustomer(@Param("customerId") Integer customerId);

    @Query("""
            select coalesce(sum(p.amount), 0) from Payment p
            where p.appointment.id = :appointmentId and p.paymentType = :type and p.status = :status""")
    BigDecimal sumForAppointment(@Param("appointmentId") Integer appointmentId, @Param("type") PaymentType type,
                                 @Param("status") PaymentStatus status);

    /** Verified money per week for the admin line chart. */
    @Query(value = """
            SELECT  DATE_SUB(DATE(p.verified_at), INTERVAL WEEKDAY(p.verified_at) DAY) AS weekStart,
                    COUNT(*)                                                         AS payments,
                    SUM(p.amount)                                                    AS amount
            FROM    payment p
            WHERE   p.status = 'VERIFIED' AND p.verified_at >= :since
            GROUP BY weekStart
            ORDER BY weekStart""", nativeQuery = true)
    List<WeeklyPaymentsRow> weeklyVerified(@Param("since") LocalDateTime since);

    interface WeeklyPaymentsRow {
        java.time.LocalDate getWeekStart();
        Long getPayments();
        BigDecimal getAmount();
    }
}
