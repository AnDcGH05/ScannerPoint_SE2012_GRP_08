package ScannerPoint.example.ScannerPoint.repair.service;

import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.entity.Appointment;
import ScannerPoint.example.ScannerPoint.customer.entity.AppointmentStatus;
import ScannerPoint.example.ScannerPoint.customer.service.AppointmentService;
import ScannerPoint.example.ScannerPoint.repair.dto.WorkflowBox;
import ScannerPoint.example.ScannerPoint.repair.dto.WorkflowResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.ApprovalStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatusHistory;
import ScannerPoint.example.ScannerPoint.repair.repository.JobCardRepository;
import ScannerPoint.example.ScannerPoint.repair.repository.JobStatusHistoryRepository;
import ScannerPoint.example.ScannerPoint.repair.repository.RepairTaskRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the eight workflow boxes shown on the customer dashboard:
 * Booked, Inspection, Diagnosis, Awaiting Approval, Repair In Progress, Quality Check,
 * Ready, Collected. Same rules as query 2.2 and section 10 of the work plan.
 */
@Service
public class WorkflowService {

    private static final String BLURRED = "BLURRED";
    private static final String CURRENT = "CURRENT";
    private static final String UPCOMING = "UPCOMING";
    private static final DateTimeFormatter COLLECT = DateTimeFormatter.ofPattern("dd MMM yyyy, h:mm a");

    private final JobCardService jobCardService;
    private final JobCardRepository jobCardRepository;
    private final JobStatusHistoryRepository historyRepository;
    private final RepairTaskRepository taskRepository;
    private final AppointmentService appointmentService;
    private final JdbcTemplate jdbcTemplate;
    private final CurrentUser currentUser;

    public WorkflowService(JobCardService jobCardService, JobCardRepository jobCardRepository,
                           JobStatusHistoryRepository historyRepository, RepairTaskRepository taskRepository,
                           AppointmentService appointmentService, JdbcTemplate jdbcTemplate, CurrentUser currentUser) {
        this.jobCardService = jobCardService;
        this.jobCardRepository = jobCardRepository;
        this.historyRepository = historyRepository;
        this.taskRepository = taskRepository;
        this.appointmentService = appointmentService;
        this.jdbcTemplate = jdbcTemplate;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public WorkflowResponse forJobCard(Integer jobCardId) {
        JobCard jc = jobCardService.findVisible(jobCardId);
        return build(jc.getAppointment(), jc);
    }

    /** For a booking card: before check-in only the "Booked" box can be active. */
    @Transactional(readOnly = true)
    public WorkflowResponse forAppointment(Integer appointmentId) {
        Appointment a = appointmentService.find(appointmentId);
        currentUser.checkOwnerOrStaff(a.getCustomer().getId());
        JobCard jc = jobCardRepository.findByAppointment_Id(appointmentId).orElse(null);
        return build(a, jc);
    }

    private WorkflowResponse build(Appointment a, JobCard jc) {
        String vehicle = jc != null ? jc.getVehicle().getDisplayName() : a.getVehicle().getDisplayName();
        String pkg = a == null ? "Walk-in" : a.getServiceType().getName();

        if (a != null && a.getStatus() == AppointmentStatus.CANCELLED) {
            return new WorkflowResponse(a.getId(), null, vehicle, pkg, "CANCELLED", null, 0, true,
                    cancelMessage(a.getId()), List.of());
        }

        List<WorkflowBox> boxes = new ArrayList<>();
        // Box 1: Booked – blurred once the deposit is verified and the booking confirmed
        LocalDateTime confirmedAt = a == null ? null : a.getConfirmedAt();
        if (a == null) {
            boxes.add(new WorkflowBox(1, "Booked", BLURRED, jc.getCheckInAt(), "Walk-in"));
        } else {
            boolean confirmed = confirmedAt != null;
            boxes.add(new WorkflowBox(1, "Booked", confirmed ? BLURRED : CURRENT, confirmedAt,
                    confirmed ? null : "Waiting for your deposit slip to be verified"));
        }

        if (jc == null) {
            for (JobStatus s : JobStatus.values()) {
                String note = s == JobStatus.INSPECTION && confirmedAt != null
                        ? "Bring your vehicle on " + a.getScheduledAt().format(COLLECT) : null;
                boxes.add(new WorkflowBox(s.getStageNo(), s.getLabel(), UPCOMING, null, note));
            }
            return new WorkflowResponse(a.getId(), null, vehicle, pkg,
                    confirmedAt == null ? "BOOKED_PENDING" : "BOOKED", null, 0, false, null, boxes);
        }

        Map<JobStatus, LocalDateTime> reached = new EnumMap<>(JobStatus.class);
        for (JobStatusHistory h : historyRepository.findByJobCardIdOrderByChangedAtAscIdAsc(jc.getId())) {
            reached.putIfAbsent(h.getStatus(), h.getChangedAt());
        }
        BigDecimal balance = jobCardRepository.balanceDue(jc.getId());
        boolean paid = balance != null && balance.signum() <= 0;
        int rank = jc.getStatus().getStageNo();

        for (JobStatus s : JobStatus.values()) {
            int stage = s.getStageNo();
            String state;
            if (s == JobStatus.READY) {
                state = (jc.getStatus() == JobStatus.COLLECTED || paid) ? BLURRED
                        : jc.getStatus() == JobStatus.READY ? CURRENT : UPCOMING;
            } else if (s == JobStatus.COLLECTED) {
                state = jc.getStatus() == JobStatus.COLLECTED ? BLURRED : paid ? CURRENT : UPCOMING;
            } else {
                state = rank > stage ? BLURRED : rank == stage ? CURRENT : UPCOMING;
            }
            String note = null;
            if (s == JobStatus.READY && jc.getEstimatedCompletion() != null) {
                note = "Collect on " + jc.getEstimatedCompletion().format(COLLECT);
            } else if (s == JobStatus.AWAITING_APPROVAL && rank > stage && !reached.containsKey(JobStatus.AWAITING_APPROVAL)) {
                note = "No extra work needed";
            } else if (s == JobStatus.READY && jc.getStatus() == JobStatus.READY && balance != null && !paid) {
                note = "Balance due: Rs. " + String.format("%,.2f", balance);
            }
            boxes.add(new WorkflowBox(stage, s.getLabel(), state, reached.get(s), note));
        }
        long waiting = taskRepository.countByJobCardIdAndApprovalStatus(jc.getId(), ApprovalStatus.PENDING);
        return new WorkflowResponse(a == null ? null : a.getId(), jc.getId(), vehicle, pkg, jc.getStatus().name(),
                jc.getEstimatedCompletion(), waiting, false, null, boxes);
    }

    private String cancelMessage(Integer appointmentId) {
        List<String> rows = jdbcTemplate.query("""
                        SELECT deposit_paid, penalty_amount, refund_amount, status FROM refund WHERE appointment_id = ?""",
                (rs, i) -> String.format("Cancelled. Deposit Rs. %,.2f, penalty Rs. %,.2f, refund Rs. %,.2f (%s)",
                        rs.getBigDecimal(1), rs.getBigDecimal(2), rs.getBigDecimal(3),
                        rs.getString(4).toLowerCase()), appointmentId);
        return rows.isEmpty() ? "Cancelled. No deposit had been paid." : rows.get(0);
    }
}
