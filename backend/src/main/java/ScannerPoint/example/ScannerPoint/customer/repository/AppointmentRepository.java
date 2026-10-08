package ScannerPoint.example.ScannerPoint.customer.repository;

import ScannerPoint.example.ScannerPoint.customer.entity.Appointment;
import ScannerPoint.example.ScannerPoint.customer.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    List<Appointment> findByCustomer_IdOrderByScheduledAtDesc(Integer customerId);

    List<Appointment> findByScheduledAtBetweenOrderByScheduledAtAscBayNoAsc(LocalDateTime from, LocalDateTime to);

    List<Appointment> findByScheduledAtBetweenAndStatusOrderByScheduledAtAscBayNoAsc(
            LocalDateTime from, LocalDateTime to, AppointmentStatus status);

    boolean existsByVehicle_IdAndStatusIn(Integer vehicleId, Collection<AppointmentStatus> statuses);

    /**
     * Bays already used at this time. uq_appt_slot (scheduled_at, bay_no) covers every
     * row, even cancelled ones, so all of them count as taken.
     */
    @Query("select a.bayNo from Appointment a where a.scheduledAt = :at")
    List<Integer> findTakenBays(@Param("at") LocalDateTime at);

    @Query("select a from Appointment a where a.scheduledAt >= :from and a.scheduledAt < :to")
    List<Appointment> findInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Verified deposit paid for a booking (from Sew's PAYMENT table). */
    @Query(value = """
            SELECT COALESCE(SUM(p.amount), 0) FROM payment p
            WHERE p.appointment_id = :id AND p.payment_type = 'DEPOSIT' AND p.status = 'VERIFIED'""",
            nativeQuery = true)
    BigDecimal depositPaid(@Param("id") Integer appointmentId);

    /** Status of the latest deposit slip: PENDING, VERIFIED, REJECTED, or null if none uploaded. */
    @Query(value = """
            SELECT p.status FROM payment p
            WHERE p.appointment_id = :id AND p.payment_type = 'DEPOSIT'
            ORDER BY p.uploaded_at DESC, p.payment_id DESC LIMIT 1""", nativeQuery = true)
    String latestDepositStatus(@Param("id") Integer appointmentId);

    /** The job card opened for this booking at check-in, if any. */
    @Query(value = "SELECT j.job_card_id FROM job_card j WHERE j.appointment_id = :id", nativeQuery = true)
    Integer jobCardId(@Param("id") Integer appointmentId);
}
