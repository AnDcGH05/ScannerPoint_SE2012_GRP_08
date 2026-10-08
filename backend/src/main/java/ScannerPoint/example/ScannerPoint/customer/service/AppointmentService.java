package ScannerPoint.example.ScannerPoint.customer.service;

import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import ScannerPoint.example.ScannerPoint.billing.service.PackageService;
import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.dto.AppointmentResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.BookingRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.CancelPreviewResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.CancelResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.RefundInfo;
import ScannerPoint.example.ScannerPoint.customer.dto.RescheduleRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.SlotResponse;
import ScannerPoint.example.ScannerPoint.customer.entity.Appointment;
import ScannerPoint.example.ScannerPoint.customer.entity.AppointmentStatus;
import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import ScannerPoint.example.ScannerPoint.customer.repository.AppointmentRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.NotifType;
import ScannerPoint.example.ScannerPoint.repair.repository.EmployeeRepository;
import ScannerPoint.example.ScannerPoint.repair.service.NotificationService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;

/**
 * Bookings: free slots (4 bays, 1-hour slots 08:00-16:00), booking with a 50% deposit,
 * confirmation after the deposit is verified, rescheduling, and cancellation with the
 * 24-hour rule (done by the sp_cancel_appointment procedure in the database).
 */
@Service
public class AppointmentService {

    public static final int BAYS = 4;
    public static final LocalTime FIRST_SLOT = LocalTime.of(8, 0);
    public static final LocalTime LAST_SLOT = LocalTime.of(15, 0);

    private static final DateTimeFormatter SLOT_LABEL = DateTimeFormatter.ofPattern("h:mm a");
    private static final DateTimeFormatter NOTICE_FORMAT = DateTimeFormatter.ofPattern("dd MMM HH:mm");
    private static final EnumSet<AppointmentStatus> ACTIVE =
            EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

    private final AppointmentRepository appointmentRepository;
    private final VehicleService vehicleService;
    private final PackageService packageService;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final JdbcTemplate jdbcTemplate;
    private final CurrentUser currentUser;
    private final TransactionTemplate readOnlyTx;

    public AppointmentService(AppointmentRepository appointmentRepository, VehicleService vehicleService,
                              PackageService packageService, EmployeeRepository employeeRepository,
                              NotificationService notificationService, JdbcTemplate jdbcTemplate,
                              CurrentUser currentUser, PlatformTransactionManager transactionManager) {
        this.appointmentRepository = appointmentRepository;
        this.vehicleService = vehicleService;
        this.packageService = packageService;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
        this.jdbcTemplate = jdbcTemplate;
        this.currentUser = currentUser;
        this.readOnlyTx = new TransactionTemplate(transactionManager);
        this.readOnlyTx.setReadOnly(true);
    }

    // ------------------------------------------------------------------ slots

    @Transactional(readOnly = true)
    public List<SlotResponse> freeSlots(LocalDate date) {
        List<SlotResponse> slots = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (LocalTime t = FIRST_SLOT; !t.isAfter(LAST_SLOT); t = t.plusHours(1)) {
            LocalDateTime start = date.atTime(t);
            List<Integer> free = start.isAfter(now) ? freeBays(start) : List.of();
            slots.add(new SlotResponse(start, t.format(SLOT_LABEL).toLowerCase(), free, !free.isEmpty()));
        }
        return slots;
    }

    private List<Integer> freeBays(LocalDateTime start) {
        List<Integer> taken = appointmentRepository.findTakenBays(start);
        List<Integer> free = new ArrayList<>();
        for (int bay = 1; bay <= BAYS; bay++) {
            if (!taken.contains(bay)) free.add(bay);
        }
        return free;
    }

    private int pickBay(LocalDateTime start, Integer wanted) {
        checkSlotTime(start);
        List<Integer> free = freeBays(start);
        if (free.isEmpty()) {
            throw new ConflictException("This time slot is fully booked. Please choose another time");
        }
        if (wanted != null) {
            if (!free.contains(wanted)) {
                throw new ConflictException("Bay " + wanted + " is already booked at this time");
            }
            return wanted;
        }
        return free.get(0);
    }

    private static void checkSlotTime(LocalDateTime start) {
        LocalTime t = start.toLocalTime();
        if (t.getMinute() != 0 || t.getSecond() != 0 || t.isBefore(FIRST_SLOT) || t.isAfter(LAST_SLOT)) {
            throw new BadRequestException("Bookings start on the hour between 8:00 am and 3:00 pm");
        }
    }

    // ------------------------------------------------------------------ booking

    /** Creates a PENDING booking; the deposit is taken from the chosen package. */
    @Transactional
    public AppointmentResponse book(BookingRequest r) {
        Vehicle vehicle = vehicleService.findOwned(r.vehicleId());
        ServiceType pkg = packageService.find(r.serviceTypeId());
        if (!Boolean.TRUE.equals(pkg.getActive())) {
            throw new BadRequestException("This package is no longer offered");
        }
        if (appointmentRepository.existsByVehicle_IdAndStatusIn(vehicle.getId(), ACTIVE)) {
            throw new ConflictException(vehicle.getRegistrationNo() + " already has an active booking");
        }
        Appointment a = new Appointment();
        a.setCustomer(vehicle.getCustomer());
        a.setVehicle(vehicle);
        a.setServiceType(pkg);
        a.setScheduledAt(r.scheduledAt().withSecond(0).withNano(0));
        a.setBayNo(pickBay(a.getScheduledAt(), r.bayNo()));
        a.setProblemDescription(r.problemDescription() == null ? null : r.problemDescription().trim());
        a.setDepositAmount(pkg.depositAmount());
        a.setStatus(AppointmentStatus.PENDING);
        appointmentRepository.saveAndFlush(a);
        return toResponse(a);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> mine() {
        return appointmentRepository.findByCustomer_IdOrderByScheduledAtDesc(currentUser.id()).stream()
                .map(this::toResponse).toList();
    }

    /** Receptionist calendar: one day (or a week with from/to), optionally one status. */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> between(LocalDate from, LocalDate to, AppointmentStatus status) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusNanos(1);
        List<Appointment> list = (status == null)
                ? appointmentRepository.findByScheduledAtBetweenOrderByScheduledAtAscBayNoAsc(start, end)
                : appointmentRepository.findByScheduledAtBetweenAndStatusOrderByScheduledAtAscBayNoAsc(start, end, status);
        return list.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> forCustomer(Integer customerId) {
        return appointmentRepository.findByCustomer_IdOrderByScheduledAtDesc(customerId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse get(Integer id) {
        return toResponse(findOwned(id));
    }

    @Transactional
    public AppointmentResponse reschedule(Integer id, RescheduleRequest r) {
        Appointment a = findOwned(id);
        if (!ACTIVE.contains(a.getStatus())) {
            throw new ConflictException("Only pending or confirmed bookings can be rescheduled");
        }
        LocalDateTime newTime = r.scheduledAt().withSecond(0).withNano(0);
        if (newTime.equals(a.getScheduledAt()) && (r.bayNo() == null || r.bayNo().equals(a.getBayNo()))) {
            return toResponse(a);
        }
        a.setBayNo(pickBay(newTime, r.bayNo()));
        a.setScheduledAt(newTime);
        appointmentRepository.saveAndFlush(a);
        return toResponse(a);
    }

    /**
     * PENDING -> CONFIRMED. Called by the receptionist, and by Sew's PaymentService when a
     * deposit slip is verified. trg_appointment_confirm refuses it (409) if the verified
     * deposit is less than the deposit amount.
     */
    @Transactional
    public AppointmentResponse confirm(Integer id, Integer employeeId) {
        Appointment a = find(id);
        if (a.getStatus() == AppointmentStatus.CONFIRMED) {
            return toResponse(a);
        }
        if (a.getStatus() != AppointmentStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be confirmed");
        }
        a.setStatus(AppointmentStatus.CONFIRMED);
        a.setConfirmedBy(employeeRepository.getReferenceById(employeeId));
        a.setConfirmedAt(LocalDateTime.now());
        appointmentRepository.saveAndFlush(a);
        notificationService.notifyCustomer(a.getCustomer().getId(), NotifType.BOOKING_CONFIRMATION,
                "Booking confirmed: " + a.getVehicle().getRegistrationNo() + ", "
                        + a.getScheduledAt().format(NOTICE_FORMAT));
        return toResponse(a);
    }

    /** Called by Sohan's check-in: the vehicle has arrived for this booking. */
    @Transactional
    public Appointment markCheckedIn(Integer id) {
        Appointment a = find(id);
        if (a.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new ConflictException("Only confirmed bookings can be checked in (the deposit must be verified first)");
        }
        a.setStatus(AppointmentStatus.CHECKED_IN);
        return appointmentRepository.saveAndFlush(a);
    }

    @Transactional
    public AppointmentResponse markNoShow(Integer id) {
        Appointment a = find(id);
        if (!ACTIVE.contains(a.getStatus())) {
            throw new ConflictException("Only pending or confirmed bookings can be marked as no-show");
        }
        if (a.getScheduledAt().isAfter(LocalDateTime.now())) {
            throw new ConflictException("The booked time has not passed yet");
        }
        a.setStatus(AppointmentStatus.NO_SHOW);
        appointmentRepository.saveAndFlush(a);
        return toResponse(a);
    }

    // ------------------------------------------------------------------ cancellation

    /** The live calculation shown in the cancel modal (same rule as sp_cancel_appointment). */
    @Transactional(readOnly = true)
    public CancelPreviewResponse cancelPreview(Integer id) {
        Appointment a = findOwned(id);
        if (!ACTIVE.contains(a.getStatus())) {
            throw new ConflictException("Only pending or confirmed bookings can be cancelled");
        }
        LocalDateTime now = LocalDateTime.now();
        if (!a.getScheduledAt().isAfter(now)) {
            throw new ConflictException("The booked time has already passed");
        }
        long hours = ChronoUnit.HOURS.between(now, a.getScheduledAt());
        BigDecimal paid = nz(appointmentRepository.depositPaid(id));
        BigDecimal penalty = hours >= 24 ? BigDecimal.ZERO.setScale(2) : paid.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal refund = paid.subtract(penalty);
        String message;
        if (paid.signum() == 0) {
            message = "No deposit has been verified for this booking, so there is nothing to refund.";
        } else if (hours >= 24) {
            message = "You are cancelling " + hours + " hours before. Full refund: Rs. " + money(paid) + ".";
        } else {
            message = "You are cancelling " + hours + " hours before. Less than 24 hours' notice: 50% of your Rs. "
                    + money(paid) + " deposit (Rs. " + money(penalty) + ") is kept as a penalty. Refund: Rs. "
                    + money(refund) + ".";
        }
        return new CancelPreviewResponse(id, a.getScheduledAt(), now, hours, paid, penalty, refund,
                penalty.signum() == 0, message);
    }

    /**
     * Cancels through the stored procedure, which applies the 24-hour rule and writes the
     * REFUND row in one database transaction. Not @Transactional on purpose: the procedure
     * starts and commits its own transaction.
     */
    public CancelResponse cancel(Integer id) {
        readOnlyTx.executeWithoutResult(s -> findOwned(id));
        jdbcTemplate.update("CALL sp_cancel_appointment(?, ?)", id, Timestamp.valueOf(LocalDateTime.now()));
        List<RefundInfo> refunds = jdbcTemplate.query("""
                        SELECT refund_id, deposit_paid, notice_hours, penalty_amount, refund_amount, status
                        FROM refund WHERE appointment_id = ?""",
                (rs, i) -> new RefundInfo(rs.getInt("refund_id"), rs.getBigDecimal("deposit_paid"),
                        rs.getInt("notice_hours"), rs.getBigDecimal("penalty_amount"),
                        rs.getBigDecimal("refund_amount"), rs.getString("status")), id);
        AppointmentResponse updated = readOnlyTx.execute(s -> toResponse(find(id)));
        return new CancelResponse(updated, refunds.isEmpty() ? null : refunds.get(0));
    }

    // ------------------------------------------------------------------ helpers

    public Appointment find(Integer id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));
    }

    private Appointment findOwned(Integer id) {
        Appointment a = find(id);
        currentUser.checkOwnerOrStaff(a.getCustomer().getId());
        return a;
    }

    public AppointmentResponse toResponse(Appointment a) {
        Integer id = a.getId();
        String slip = appointmentRepository.latestDepositStatus(id);
        return new AppointmentResponse(id, a.getCustomer().getId(), a.getCustomer().getFullName(),
                a.getVehicle().getId(), a.getVehicle().getDisplayName(), a.getVehicle().getRegistrationNo(),
                a.getServiceType().getId(), a.getServiceType().getName(), a.getServiceType().getPricingType(),
                a.getScheduledAt(), a.getBayNo(), a.getStatus(), a.getProblemDescription(), a.getDepositAmount(),
                nz(appointmentRepository.depositPaid(id)), Objects.requireNonNullElse(slip, "NOT_UPLOADED"),
                String.format("BOOKING-%04d", id), a.getConfirmedAt(),
                a.getConfirmedBy() == null ? null : a.getConfirmedBy().getFullName(),
                a.getCancelledAt(), a.getCreatedAt(), appointmentRepository.jobCardId(id));
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO.setScale(2) : v.setScale(2, RoundingMode.HALF_UP);
    }

    private static String money(BigDecimal v) {
        return String.format("%,.2f", v);
    }
}
