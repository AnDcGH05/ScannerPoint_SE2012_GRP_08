package ScannerPoint.example.ScannerPoint.repair.repository;

import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface JobCardRepository extends JpaRepository<JobCard, Integer> {

    List<JobCard> findByStatusOrderByStatusChangedAtAsc(JobStatus status);

    List<JobCard> findByStatusNotOrderByCheckInAtAsc(JobStatus status);

    List<JobCard> findByMechanic_IdAndStatusInOrderByCheckInAtAsc(Integer mechanicId, Collection<JobStatus> statuses);

    List<JobCard> findByVehicle_Customer_IdOrderByCheckInAtDesc(Integer customerId);

    Optional<JobCard> findByAppointment_Id(Integer appointmentId);

    boolean existsByVehicle_IdAndStatusNot(Integer vehicleId, JobStatus status);

    /** Bill balance from Sew's v_invoice_summary view; null when no bill exists yet. */
    @Query(value = "SELECT s.balance_due FROM v_invoice_summary s WHERE s.job_card_id = :id", nativeQuery = true)
    BigDecimal balanceDue(@Param("id") Integer jobCardId);

    /** Part requests from Tevindu's PART_REQUEST table still waiting for the storekeeper. */
    @Query(value = "SELECT COUNT(*) FROM part_request r WHERE r.job_card_id = :id AND r.status IN ('PENDING','BACK_ORDERED')",
            nativeQuery = true)
    long openPartRequests(@Param("id") Integer jobCardId);

    /** Query 2.1 – each mechanic's open and completed jobs. */
    @Query(value = """
            SELECT  e.employee_id                                   AS mechanicId,
                    CONCAT(e.first_name, ' ', e.last_name)          AS mechanic,
                    e.specialization                                AS specialization,
                    SUM(CASE WHEN j.status NOT IN ('READY','COLLECTED') THEN 1 ELSE 0 END) AS openJobs,
                    SUM(CASE WHEN j.status IN ('READY','COLLECTED') THEN 1 ELSE 0 END)     AS completedJobs
            FROM    employee e
            LEFT JOIN job_card j ON j.mechanic_id = e.employee_id
            WHERE   e.emp_role = 'MECHANIC'
            GROUP BY e.employee_id, e.first_name, e.last_name, e.specialization
            ORDER BY openJobs DESC, completedJobs DESC""", nativeQuery = true)
    List<MechanicWorkloadRow> mechanicWorkload();

    /** Query 2.5 – average hours spent in each workflow stage. */
    @Query(value = """
            SELECT  h.status                                                            AS stage,
                    COUNT(*)                                                            AS timesPassed,
                    ROUND(AVG(TIMESTAMPDIFF(MINUTE, h.changed_at, h.next_at)) / 60, 1)  AS avgHours
            FROM   (SELECT status, changed_at,
                           LEAD(changed_at) OVER (PARTITION BY job_card_id ORDER BY changed_at) AS next_at
                      FROM job_status_history) h
            WHERE   h.next_at IS NOT NULL
            GROUP BY h.status
            ORDER BY MIN(CASE h.status WHEN 'INSPECTION' THEN 2 WHEN 'DIAGNOSIS' THEN 3 WHEN 'AWAITING_APPROVAL' THEN 4
                                       WHEN 'IN_PROGRESS' THEN 5 WHEN 'QUALITY_CHECK' THEN 6 WHEN 'READY' THEN 7 END)""",
            nativeQuery = true)
    List<StageTimeRow> averageStageTimes();

    interface MechanicWorkloadRow {
        Integer getMechanicId();
        String getMechanic();
        String getSpecialization();
        Long getOpenJobs();
        Long getCompletedJobs();
    }

    interface StageTimeRow {
        String getStage();
        Long getTimesPassed();
        BigDecimal getAvgHours();
    }
}
