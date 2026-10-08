package ScannerPoint.example.ScannerPoint.customer.repository;

import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    List<Vehicle> findByCustomer_IdOrderByIdAsc(Integer customerId);

    long countByCustomer_Id(Integer customerId);

    boolean existsByRegistrationNoIgnoreCase(String registrationNo);

    List<Vehicle> findByRegistrationNoContainingIgnoreCaseOrderByRegistrationNoAsc(String plate);

    /** A vehicle with bookings or job cards keeps its history and cannot be removed. */
    @Query(value = """
            SELECT (EXISTS (SELECT 1 FROM job_card j WHERE j.vehicle_id = :id)
                 OR EXISTS (SELECT 1 FROM appointment a WHERE a.vehicle_id = :id))""", nativeQuery = true)
    long hasServiceHistory(@Param("id") Integer vehicleId);

    /** Query 1.2 – digital service history of one vehicle. */
    @Query(value = """
            SELECT  j.job_card_id                         AS jobCardId,
                    j.check_in_at                         AS checkInAt,
                    j.check_in_mileage                    AS mileage,
                    j.status                              AS status,
                    COALESCE(st.service_name, 'Walk-in')  AS packageName,
                    i.diagnosis                           AS diagnosis,
                    COUNT(t.task_no)                      AS tasksDone,
                    s.total                               AS invoiceTotal
            FROM    job_card j
            LEFT JOIN appointment a       ON a.appointment_id = j.appointment_id
            LEFT JOIN service_type st     ON st.service_type_id = a.service_type_id
            LEFT JOIN inspection i        ON i.job_card_id = j.job_card_id
            LEFT JOIN repair_task t       ON t.job_card_id = j.job_card_id AND t.task_status = 'DONE'
            LEFT JOIN v_invoice_summary s ON s.job_card_id = j.job_card_id
            WHERE   j.vehicle_id = :id
            GROUP BY j.job_card_id, j.check_in_at, j.check_in_mileage, j.status, st.service_name, i.diagnosis, s.total
            ORDER BY j.check_in_at DESC""", nativeQuery = true)
    List<ServiceHistoryRow> serviceHistory(@Param("id") Integer vehicleId);

    /**
     * Query 1.3 – predictive maintenance: vehicles due for a service
     * (6 months or 5,000 km since the last one) and when we last reminded the owner.
     */
    @Query(value = """
            SELECT  v.vehicle_id                                          AS vehicleId,
                    v.registration_no                                     AS registrationNo,
                    CONCAT(v.make, ' ', v.model)                          AS makeModel,
                    c.customer_id                                         AS customerId,
                    CONCAT(c.first_name, ' ', c.last_name)                AS owner,
                    v.last_service_date                                   AS lastServiceDate,
                    TIMESTAMPDIFF(MONTH, v.last_service_date, CURDATE())  AS monthsSince,
                    v.current_mileage - v.last_service_mileage            AS kmSince,
                    (SELECT MAX(n.sent_at) FROM notification n
                      WHERE n.customer_id = c.customer_id
                        AND n.notif_type = 'SERVICE_REMINDER'
                        AND n.delivery_status = 'SENT')                   AS lastReminder
            FROM    vehicle v
            JOIN    customer c ON c.customer_id = v.customer_id
            WHERE  (TIMESTAMPDIFF(MONTH, v.last_service_date, CURDATE()) >= 6
                OR  v.current_mileage - v.last_service_mileage >= 5000)
              AND  (:customerId IS NULL OR c.customer_id = :customerId)
            ORDER BY monthsSince DESC""", nativeQuery = true)
    List<ServiceDueRow> dueForService(@Param("customerId") Integer customerId);

    interface ServiceHistoryRow {
        Integer getJobCardId();
        LocalDateTime getCheckInAt();
        Integer getMileage();
        String getStatus();
        String getPackageName();
        String getDiagnosis();
        Long getTasksDone();
        BigDecimal getInvoiceTotal();
    }

    interface ServiceDueRow {
        Integer getVehicleId();
        String getRegistrationNo();
        String getMakeModel();
        Integer getCustomerId();
        String getOwner();
        LocalDate getLastServiceDate();
        Long getMonthsSince();
        Long getKmSince();
        LocalDateTime getLastReminder();
    }
}
