package ScannerPoint.example.ScannerPoint.billing.service;

import ScannerPoint.example.ScannerPoint.billing.dto.BankDetailsResponse;
import ScannerPoint.example.ScannerPoint.billing.dto.PaymentResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.Invoice;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceStatus;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceSummary;
import ScannerPoint.example.ScannerPoint.billing.entity.Payment;
import ScannerPoint.example.ScannerPoint.billing.entity.PaymentStatus;
import ScannerPoint.example.ScannerPoint.billing.entity.PaymentType;
import ScannerPoint.example.ScannerPoint.billing.repository.BillingReportRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.InvoiceRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.InvoiceSummaryRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.PaymentRepository;
import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.common.storage.FileStorageService;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.entity.Appointment;
import ScannerPoint.example.ScannerPoint.customer.entity.AppointmentStatus;
import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.service.AppointmentService;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import ScannerPoint.example.ScannerPoint.repair.entity.NotifType;
import ScannerPoint.example.ScannerPoint.repair.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Bank-transfer slips. Verifying a full deposit confirms the booking (so the "Booked" box
 * blurs); verifying the last final payment marks the bill PAID (so the "Ready" box blurs
 * and the vehicle can be released).
 */
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceSummaryRepository summaryRepository;
    private final BillingReportRepository reportRepository;
    private final AppointmentService appointmentService;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final CurrentUser currentUser;
    private final BankDetailsResponse bankDetails;

    public PaymentService(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository,
                          InvoiceSummaryRepository summaryRepository, BillingReportRepository reportRepository,
                          AppointmentService appointmentService, NotificationService notificationService,
                          FileStorageService fileStorageService, CurrentUser currentUser,
                          @Value("${app.bank.name}") String bankName,
                          @Value("${app.bank.branch}") String branch,
                          @Value("${app.bank.account-name}") String accountName,
                          @Value("${app.bank.account-no}") String accountNo) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.summaryRepository = summaryRepository;
        this.reportRepository = reportRepository;
        this.appointmentService = appointmentService;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
        this.currentUser = currentUser;
        this.bankDetails = new BankDetailsResponse(bankName, branch, accountName, accountNo);
    }

    public BankDetailsResponse bankDetails() {
        return bankDetails;
    }

    // ------------------------------------------------------------------ upload

    @Transactional
    public PaymentResponse uploadDeposit(Integer appointmentId, BigDecimal amount, String bankReference,
                                         LocalDate paidOn, MultipartFile file) {
        Appointment a = appointmentService.find(appointmentId);
        currentUser.checkOwnerOrStaff(a.getCustomer().getId());
        if (a.getStatus() != AppointmentStatus.PENDING) {
            throw new ConflictException("This booking is " + a.getStatus().name().toLowerCase() + " – no deposit is needed");
        }
        if (paymentRepository.existsByAppointment_IdAndStatus(appointmentId, PaymentStatus.PENDING)) {
            throw new ConflictException("A slip for this booking is already waiting for verification");
        }
        Payment p = newPayment(PaymentType.DEPOSIT, amount, bankReference, paidOn, file);
        p.setAppointment(a);
        return toResponse(paymentRepository.saveAndFlush(p), null);
    }

    @Transactional
    public PaymentResponse uploadFinal(Integer invoiceId, BigDecimal amount, String bankReference,
                                       LocalDate paidOn, MultipartFile file) {
        Invoice inv = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new NotFoundException("Bill not found with id: " + invoiceId));
        currentUser.checkOwnerOrStaff(inv.getJobCard().getVehicle().getCustomer().getId());
        if (inv.getStatus() == InvoiceStatus.PAID) {
            throw new ConflictException("This bill is already paid");
        }
        if (inv.getStatus() != InvoiceStatus.ISSUED) {
            throw new ConflictException("This bill has not been issued yet");
        }
        if (paymentRepository.existsByInvoice_IdAndStatus(invoiceId, PaymentStatus.PENDING)) {
            throw new ConflictException("A slip for this bill is already waiting for verification");
        }
        Payment p = newPayment(PaymentType.FINAL, amount, bankReference, paidOn, file);
        p.setInvoice(inv);
        return toResponse(paymentRepository.saveAndFlush(p), null);
    }

    private Payment newPayment(PaymentType type, BigDecimal amount, String bankReference, LocalDate paidOn,
                               MultipartFile file) {
        if (amount == null || amount.signum() <= 0) {
            throw new BadRequestException("Enter the amount shown on the slip");
        }
        if (paidOn == null || paidOn.isAfter(LocalDate.now())) {
            throw new BadRequestException("The date on the slip cannot be in the future");
        }
        if (bankReference != null && bankReference.length() > 30) {
            throw new BadRequestException("Bank reference must be at most 30 characters");
        }
        Payment p = new Payment();
        p.setPaymentType(type);
        p.setAmount(amount);
        p.setBankReference(bankReference == null || bankReference.isBlank() ? null : bankReference.trim());
        p.setPaidOn(paidOn);
        p.setSlipFile(fileStorageService.store(file, "slips"));
        return p;
    }

    // ------------------------------------------------------------------ verify / reject

    @Transactional
    public PaymentResponse verify(Integer id, Employee receptionist) {
        Payment p = findPending(id);
        p.decide(PaymentStatus.VERIFIED, receptionist, null);
        paymentRepository.saveAndFlush(p); // flushed first so the trigger and the view can see it

        if (p.getPaymentType() == PaymentType.DEPOSIT) {
            Appointment a = p.getAppointment();
            BigDecimal paid = paymentRepository.sumForAppointment(a.getId(), PaymentType.DEPOSIT, PaymentStatus.VERIFIED);
            if (a.getStatus() == AppointmentStatus.PENDING && paid.compareTo(a.getDepositAmount()) >= 0) {
                appointmentService.confirm(a.getId(), receptionist.getId()); // "Booked" box blurs
            }
        } else {
            Invoice inv = p.getInvoice();
            BigDecimal balance = summaryRepository.findById(inv.getId()).map(InvoiceSummary::getBalanceDue).orElse(null);
            Integer customerId = inv.getJobCard().getVehicle().getCustomer().getId();
            if (balance != null && balance.signum() <= 0) {
                inv.setStatus(InvoiceStatus.PAID);  // "Ready" box blurs, vehicle can be released
                invoiceRepository.saveAndFlush(inv);
                notificationService.notifyCustomer(customerId, NotifType.PAYMENT_RECEIPT,
                        "Payment of Rs. " + money(p.getAmount()) + " received for " + inv.getInvoiceNo()
                                + ". Your bill is fully paid. Thank you!");
            } else {
                notificationService.notifyCustomer(customerId, NotifType.PAYMENT_RECEIPT,
                        "Payment of Rs. " + money(p.getAmount()) + " received for " + inv.getInvoiceNo()
                                + ". Balance due: Rs. " + money(balance == null ? BigDecimal.ZERO : balance));
            }
        }
        return toResponse(p, null);
    }

    @Transactional
    public PaymentResponse reject(Integer id, String reason, Employee receptionist) {
        Payment p = findPending(id);
        p.decide(PaymentStatus.REJECTED, receptionist, reason.trim());
        return toResponse(paymentRepository.saveAndFlush(p), null);
    }

    // ------------------------------------------------------------------ queries

    /** Verification queue (query 4.3), oldest first, with the amount expected. */
    @Transactional(readOnly = true)
    public List<PaymentResponse> pending() {
        Map<Integer, BigDecimal> expected = new HashMap<>();
        reportRepository.expectedAmounts().forEach(r -> expected.put(r.getPaymentId(), r.getAmountExpected()));
        return paymentRepository.findByStatusOrderByUploadedAtAsc(PaymentStatus.PENDING).stream()
                .map(p -> toResponse(p, expected.get(p.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> mine() {
        return paymentRepository.findForCustomer(currentUser.id()).stream().map(p -> toResponse(p, null)).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> forAppointment(Integer appointmentId) {
        Appointment a = appointmentService.find(appointmentId);
        currentUser.checkOwnerOrStaff(a.getCustomer().getId());
        return paymentRepository.findByAppointment_IdOrderByUploadedAtDesc(appointmentId).stream()
                .map(p -> toResponse(p, null)).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> forInvoice(Integer invoiceId) {
        Invoice inv = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new NotFoundException("Bill not found with id: " + invoiceId));
        currentUser.checkOwnerOrStaff(inv.getJobCard().getVehicle().getCustomer().getId());
        return paymentRepository.findByInvoice_IdOrderByUploadedAtDesc(invoiceId).stream()
                .map(p -> toResponse(p, null)).toList();
    }

    @Transactional(readOnly = true)
    public Payment findForSlip(Integer id) {
        Payment p = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + id));
        currentUser.checkOwnerOrStaff(customerOf(p).getId());
        return p;
    }

    public Resource slip(Payment p) {
        return fileStorageService.load(p.getSlipFile());
    }

    private Payment findPending(Integer id) {
        Payment p = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + id));
        if (p.getStatus() != PaymentStatus.PENDING) {
            throw new ConflictException("This slip has already been " + p.getStatus().name().toLowerCase());
        }
        return p;
    }

    private static Customer customerOf(Payment p) {
        return p.getPaymentType() == PaymentType.DEPOSIT
                ? p.getAppointment().getCustomer()
                : p.getInvoice().getJobCard().getVehicle().getCustomer();
    }

    private PaymentResponse toResponse(Payment p, BigDecimal expected) {
        Customer c = customerOf(p);
        boolean deposit = p.getPaymentType() == PaymentType.DEPOSIT;
        if (expected == null && deposit) {
            expected = p.getAppointment().getDepositAmount();
        }
        long waiting = p.getStatus() == PaymentStatus.PENDING
                ? Duration.between(p.getUploadedAt(), LocalDateTime.now()).toHours() : 0;
        return new PaymentResponse(p.getId(), p.getPaymentType(),
                deposit ? p.getAppointment().getId() : null, deposit ? null : p.getInvoice().getId(),
                deposit ? "Booking " + p.getAppointment().getId() : p.getInvoice().getInvoiceNo(),
                c.getId(), c.getFullName(), p.getAmount(), expected,
                expected == null || expected.compareTo(p.getAmount()) == 0,
                p.getBankReference(), p.getPaidOn(), p.getUploadedAt(), waiting, p.getStatus(),
                p.getVerifiedBy() == null ? null : p.getVerifiedBy().getFullName(), p.getVerifiedAt(),
                p.getRejectReason(), "/api/payments/" + p.getId() + "/slip");
    }

    private static String money(BigDecimal v) {
        return String.format("%,.2f", v);
    }
}
