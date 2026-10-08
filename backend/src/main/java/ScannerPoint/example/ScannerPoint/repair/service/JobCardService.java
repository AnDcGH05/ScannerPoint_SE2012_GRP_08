package ScannerPoint.example.ScannerPoint.repair.service;

import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.billing.repository.ServiceTypeRepository;
import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.ForbiddenException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.entity.Appointment;
import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository;
import ScannerPoint.example.ScannerPoint.customer.service.AppointmentService;
import ScannerPoint.example.ScannerPoint.customer.service.DocumentService;
import ScannerPoint.example.ScannerPoint.repair.dto.CheckInRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.HistoryResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.InspectionRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.InspectionResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.JobCardDetailResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.JobCardResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.StageRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.TaskResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.ApprovalStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.EmpRole;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import ScannerPoint.example.ScannerPoint.repair.entity.Inspection;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.NotifType;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import ScannerPoint.example.ScannerPoint.repair.entity.TaskStatus;
import ScannerPoint.example.ScannerPoint.repair.repository.EmployeeRepository;
import ScannerPoint.example.ScannerPoint.repair.repository.InspectionRepository;
import ScannerPoint.example.ScannerPoint.repair.repository.JobCardRepository;
import ScannerPoint.example.ScannerPoint.repair.repository.JobStatusHistoryRepository;
import ScannerPoint.example.ScannerPoint.repair.repository.RepairTaskRepository;
import ScannerPoint.example.ScannerPoint.user.entity.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Check-in, mechanic assignment and the smart repair workflow.
 * The allowed next stages come from the JobStatus state objects (State pattern);
 * the database triggers write the stage history and refuse a release while the bill is unpaid.
 */
@Service
public class JobCardService {

    private final JobCardRepository jobCardRepository;
    private final RepairTaskRepository taskRepository;
    private final InspectionRepository inspectionRepository;
    private final JobStatusHistoryRepository historyRepository;
    private final EmployeeRepository employeeRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final AppointmentService appointmentService;
    private final DocumentService documentService;
    private final NotificationService notificationService;
    private final CurrentUser currentUser;

    public JobCardService(JobCardRepository jobCardRepository, RepairTaskRepository taskRepository,
                          InspectionRepository inspectionRepository, JobStatusHistoryRepository historyRepository,
                          EmployeeRepository employeeRepository, VehicleRepository vehicleRepository,
                          ServiceTypeRepository serviceTypeRepository, AppointmentService appointmentService,
                          DocumentService documentService, NotificationService notificationService,
                          CurrentUser currentUser) {
        this.jobCardRepository = jobCardRepository;
        this.taskRepository = taskRepository;
        this.inspectionRepository = inspectionRepository;
        this.historyRepository = historyRepository;
        this.employeeRepository = employeeRepository;
        this.vehicleRepository = vehicleRepository;
        this.serviceTypeRepository = serviceTypeRepository;
        this.appointmentService = appointmentService;
        this.documentService = documentService;
        this.notificationService = notificationService;
        this.currentUser = currentUser;
    }

    // ------------------------------------------------------------------ check-in

    @Transactional
    public JobCardResponse checkIn(CheckInRequest r) {
        Employee receptionist = me();
        Appointment appointment = null;
        Vehicle vehicle;
        if (r.appointmentId() != null) {
            appointment = appointmentService.find(r.appointmentId());
            if (jobCardRepository.findByAppointment_Id(appointment.getId()).isPresent()) {
                throw new ConflictException("This booking has already been checked in");
            }
            vehicle = appointment.getVehicle();
        } else if (r.vehicleId() != null) {
            vehicle = vehicleRepository.findById(r.vehicleId())
                    .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + r.vehicleId()));
        } else {
            throw new BadRequestException("Choose a booking or a walk-in vehicle");
        }
        if (jobCardRepository.existsByVehicle_IdAndStatusNot(vehicle.getId(), JobStatus.COLLECTED)) {
            throw new ConflictException(vehicle.getRegistrationNo() + " is already in the workshop");
        }
        if (!documentService.bothDocumentsVerified(vehicle.getId())) {
            throw new ConflictException("The driving licence and insurance must both be verified before check-in");
        }
        if (appointment != null) {
            appointmentService.markCheckedIn(appointment.getId()); // must be CONFIRMED
        }
        JobCard jc = new JobCard();
        jc.setVehicle(vehicle);
        jc.setAppointment(appointment);
        jc.setCreatedBy(receptionist);
        jc.setMechanic(r.mechanicId() == null ? null : mechanic(r.mechanicId()));
        jc.setCheckInAt(LocalDateTime.now());
        jc.setCheckInMileage(r.mileage());
        jc.setEstimatedCompletion(r.estimatedCompletion());
        jc.changeStatus(JobStatus.INSPECTION, receptionist);
        if (r.mileage() > vehicle.getCurrentMileage()) {
            vehicle.setCurrentMileage(r.mileage());
        }
        jobCardRepository.saveAndFlush(jc);
        return toResponse(jc);
    }

    @Transactional
    public JobCardResponse assignMechanic(Integer id, Integer mechanicId) {
        JobCard jc = find(id);
        if (jc.getStatus() == JobStatus.COLLECTED) {
            throw new ConflictException("This job is already closed");
        }
        jc.setMechanic(mechanic(mechanicId));
        jobCardRepository.saveAndFlush(jc); // trg_job_card_before_upd double-checks the role
        return toResponse(jc);
    }

    // ------------------------------------------------------------------ workflow

    @Transactional
    public JobCardResponse moveTo(Integer id, StageRequest r) {
        JobCard jc = find(id);
        checkCanWork(jc);
        JobStatus target = r.status();
        if (target == JobStatus.COLLECTED) {
            throw new ConflictException("Use \"Release vehicle\" to hand the vehicle back");
        }
        if (!jc.getStatus().canMoveTo(target)) {
            throw new ConflictException("A job in " + jc.getStatus().getLabel() + " cannot move to " + target.getLabel());
        }
        checkEntryRules(jc, target);
        if (r.estimatedCompletion() != null) {
            jc.setEstimatedCompletion(r.estimatedCompletion());
        }
        jc.changeStatus(target, me());
        String plate = jc.getVehicle().getRegistrationNo();
        Integer customerId = jc.getVehicle().getCustomer().getId();
        if (target == JobStatus.AWAITING_APPROVAL) {
            String work = taskRepository.findByJobCardIdOrderByTaskNoAsc(id).stream()
                    .filter(t -> t.getApprovalStatus() == ApprovalStatus.PENDING)
                    .map(RepairTask::getDescription).collect(Collectors.joining(", "));
            notificationService.notifyCustomer(customerId, NotifType.APPROVAL_REQUEST,
                    "Extra work on " + plate + ": " + work + ". Approve?");
        }
        if (target == JobStatus.READY) {
            jc.setCompletedAt(LocalDateTime.now());
            Vehicle v = jc.getVehicle();          // feeds predictive maintenance
            v.setLastServiceDate(LocalDateTime.now().toLocalDate());
            v.setLastServiceMileage(Math.min(jc.getCheckInMileage(), v.getCurrentMileage()));
            notificationService.notifyCustomer(customerId, NotifType.VEHICLE_READY, plate + " is ready for collection");
        }
        jobCardRepository.saveAndFlush(jc);
        return toResponse(jc);
    }

    /** Conditions each stage needs before the job may enter it. */
    private void checkEntryRules(JobCard jc, JobStatus target) {
        List<RepairTask> tasks = taskRepository.findByJobCardIdOrderByTaskNoAsc(jc.getId());
        long pendingApprovals = tasks.stream().filter(t -> t.getApprovalStatus() == ApprovalStatus.PENDING).count();
        switch (target) {
            case DIAGNOSIS -> {
                if (!inspectionRepository.existsById(jc.getId())) {
                    throw new ConflictException("Save the inspection first");
                }
            }
            case AWAITING_APPROVAL -> {
                if (pendingApprovals == 0) {
                    throw new ConflictException("Add the extra work that needs the customer's approval first");
                }
            }
            case IN_PROGRESS -> {
                if (jc.getStatus() != JobStatus.QUALITY_CHECK && pendingApprovals > 0) {
                    throw new ConflictException("The customer has not answered all the extra work yet");
                }
            }
            case QUALITY_CHECK -> {
                List<RepairTask> live = tasks.stream().filter(t -> t.getTaskStatus() != TaskStatus.CANCELLED).toList();
                if (live.isEmpty()) {
                    throw new ConflictException("Add the repair tasks first");
                }
                if (live.stream().anyMatch(t -> t.getTaskStatus() != TaskStatus.DONE)) {
                    throw new ConflictException("All tasks must be done before the quality check");
                }
            }
            default -> { }
        }
    }

    /** READY -> COLLECTED, only when the bill is fully paid (trg_job_card_before_upd is the backup). */
    @Transactional
    public JobCardResponse release(Integer id) {
        JobCard jc = find(id);
        if (jc.getStatus() != JobStatus.READY) {
            throw new ConflictException("Only vehicles that are Ready can be released");
        }
        BigDecimal balance = jobCardRepository.balanceDue(id);
        if (balance == null) {
            throw new ConflictException("The bill has not been generated yet");
        }
        if (balance.signum() > 0) {
            throw new ConflictException("Vehicle cannot be released until the bill is paid (balance Rs. "
                    + String.format("%,.2f", balance) + ")");
        }
        jc.changeStatus(JobStatus.COLLECTED, me());
        jobCardRepository.saveAndFlush(jc);
        return toResponse(jc);
    }

    // ------------------------------------------------------------------ inspection

    /** Saving the inspection moves the job from Inspection to Diagnosis. */
    @Transactional
    public InspectionResponse saveInspection(Integer id, InspectionRequest r) {
        JobCard jc = find(id);
        checkCanWork(jc);
        if (jc.getStatus() != JobStatus.INSPECTION && jc.getStatus() != JobStatus.DIAGNOSIS) {
            throw new ConflictException("The inspection can only be changed during Inspection or Diagnosis");
        }
        Inspection i = inspectionRepository.findById(id).orElseGet(() -> new Inspection(jc));
        i.setInspectedAt(LocalDateTime.now());
        i.setFindings(r.findings().trim());
        i.setDiagnosis(blankToNull(r.diagnosis()));
        i.setRecommendedAction(blankToNull(r.recommendedAction()));
        inspectionRepository.saveAndFlush(i);
        if (jc.getStatus() == JobStatus.INSPECTION) {
            jc.changeStatus(JobStatus.DIAGNOSIS, me());
            jobCardRepository.saveAndFlush(jc);
        }
        return InspectionResponse.from(i);
    }

    @Transactional(readOnly = true)
    public InspectionResponse inspection(Integer id) {
        findVisible(id);
        return inspectionRepository.findById(id).map(InspectionResponse::from).orElse(null);
    }

    // ------------------------------------------------------------------ queries

    /** Job board: every job not yet collected, or one stage with ?status=. */
    @Transactional(readOnly = true)
    public List<JobCardResponse> list(JobStatus status) {
        List<JobCard> jobs = status == null
                ? jobCardRepository.findByStatusNotOrderByCheckInAtAsc(JobStatus.COLLECTED)
                : jobCardRepository.findByStatusOrderByStatusChangedAtAsc(status);
        return jobs.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<JobCardResponse> assignedToMe() {
        return jobCardRepository.findByMechanic_IdAndStatusInOrderByCheckInAtAsc(currentUser.id(),
                        EnumSet.complementOf(EnumSet.of(JobStatus.COLLECTED)))
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<JobCardResponse> mine() {
        return jobCardRepository.findByVehicle_Customer_IdOrderByCheckInAtDesc(currentUser.id()).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public JobCardDetailResponse detail(Integer id) {
        JobCard jc = findVisible(id);
        BigDecimal rate = labourRate(jc);
        List<TaskResponse> tasks = taskRepository.findByJobCardIdOrderByTaskNoAsc(id).stream()
                .map(t -> TaskResponse.from(t, rate)).toList();
        return new JobCardDetailResponse(toResponse(jc),
                jc.getAppointment() == null ? null : jc.getAppointment().getProblemDescription(),
                inspectionRepository.findById(id).map(InspectionResponse::from).orElse(null),
                tasks, history(id));
    }

    @Transactional(readOnly = true)
    public List<HistoryResponse> history(Integer id) {
        findVisible(id);
        return historyRepository.findByJobCardIdOrderByChangedAtAscIdAsc(id).stream()
                .map(HistoryResponse::from).toList();
    }

    // ------------------------------------------------------------------ helpers

    public JobCard find(Integer id) {
        return jobCardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Job card not found with id: " + id));
    }

    /** Customers may only see jobs for their own vehicles. */
    public JobCard findVisible(Integer id) {
        JobCard jc = find(id);
        currentUser.checkOwnerOrStaff(jc.getVehicle().getCustomer().getId());
        return jc;
    }

    /** A mechanic may only work on the jobs assigned to them; the admin may work on any. */
    public void checkCanWork(JobCard jc) {
        if (currentUser.role() == Role.MECHANIC
                && (jc.getMechanic() == null || !Objects.equals(jc.getMechanic().getId(), currentUser.id()))) {
            throw new ForbiddenException("This job is assigned to another mechanic");
        }
    }

    /** Package labour rate; walk-ins use the diagnostics (variable) package rate. */
    public BigDecimal labourRate(JobCard jc) {
        if (jc.getAppointment() != null) {
            return jc.getAppointment().getServiceType().getLabourRate();
        }
        return serviceTypeRepository.findFirstByPricingTypeAndActiveTrueOrderByIdAsc(PricingType.VARIABLE)
                .map(s -> s.getLabourRate()).orElse(null);
    }

    private Employee me() {
        return employeeRepository.findById(currentUser.id())
                .orElseThrow(() -> new ForbiddenException("Only staff can do this"));
    }

    private Employee mechanic(Integer id) {
        Employee m = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Mechanic not found with id: " + id));
        if (m.getEmpRole() != EmpRole.MECHANIC || !Boolean.TRUE.equals(m.getActive())) {
            throw new BadRequestException(m.getFullName() + " is not an active mechanic");
        }
        return m;
    }

    public JobCardResponse toResponse(JobCard jc) {
        Integer id = jc.getId();
        BigDecimal balance = jobCardRepository.balanceDue(id);
        Appointment a = jc.getAppointment();
        return new JobCardResponse(id, jc.getVehicle().getId(), jc.getVehicle().getDisplayName(),
                jc.getVehicle().getRegistrationNo(), jc.getVehicle().getCustomer().getId(),
                jc.getVehicle().getCustomer().getFullName(), a == null ? null : a.getId(),
                a == null ? "Walk-in" : a.getServiceType().getName(),
                jc.getMechanic() == null ? null : jc.getMechanic().getId(),
                jc.getMechanic() == null ? "Unassigned" : jc.getMechanic().getFullName(),
                jc.getCreatedBy().getFullName(), jc.getCheckInAt(), jc.getCheckInMileage(),
                jc.getStatus(), jc.getStatus().getLabel(), jc.getStatusChangedAt(),
                Duration.between(jc.getStatusChangedAt(), LocalDateTime.now()).toHours(),
                jc.getEstimatedCompletion(), jc.getCompletedAt(),
                taskRepository.countByJobCardIdAndApprovalStatus(id, ApprovalStatus.PENDING),
                jobCardRepository.openPartRequests(id), balance,
                jc.getStatus() == JobStatus.READY && balance != null && balance.signum() <= 0);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
