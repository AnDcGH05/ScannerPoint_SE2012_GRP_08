package ScannerPoint.example.ScannerPoint.billing.controller;

import ScannerPoint.example.ScannerPoint.billing.dto.BankDetailsResponse;
import ScannerPoint.example.ScannerPoint.billing.dto.PaymentResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.Payment;
import ScannerPoint.example.ScannerPoint.billing.service.PaymentService;
import ScannerPoint.example.ScannerPoint.common.dto.ReasonRequest;
import ScannerPoint.example.ScannerPoint.common.storage.FileStorageService;
import ScannerPoint.example.ScannerPoint.repair.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final StaffService staffService;
    private final FileStorageService fileStorageService;

    public PaymentController(PaymentService paymentService, StaffService staffService,
                             FileStorageService fileStorageService) {
        this.paymentService = paymentService;
        this.staffService = staffService;
        this.fileStorageService = fileStorageService;
    }

    /** HNB account shown on the "Pay by bank transfer" card. */
    @GetMapping("/bank-details")
    public BankDetailsResponse bankDetails() {
        return paymentService.bankDetails();
    }

    /** multipart/form-data: file, appointmentId, amount, paidOn (yyyy-MM-dd), bankReference. */
    @PostMapping(value = "/deposit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST')")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse uploadDeposit(@RequestPart("file") MultipartFile file,
                                         @RequestParam Integer appointmentId,
                                         @RequestParam BigDecimal amount,
                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paidOn,
                                         @RequestParam(required = false) String bankReference) {
        return paymentService.uploadDeposit(appointmentId, amount, bankReference, paidOn, file);
    }

    /** multipart/form-data: file, invoiceId, amount, paidOn (yyyy-MM-dd), bankReference. */
    @PostMapping(value = "/final", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST')")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse uploadFinal(@RequestPart("file") MultipartFile file,
                                       @RequestParam Integer invoiceId,
                                       @RequestParam BigDecimal amount,
                                       @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paidOn,
                                       @RequestParam(required = false) String bankReference) {
        return paymentService.uploadFinal(invoiceId, amount, bankReference, paidOn, file);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<PaymentResponse> mine() {
        return paymentService.mine();
    }

    /** "Payment slips to verify" queue. */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public List<PaymentResponse> pending() {
        return paymentService.pending();
    }

    /** All slips for one booking (?appointmentId=) or one bill (?invoiceId=). */
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public List<PaymentResponse> list(@RequestParam(required = false) Integer appointmentId,
                                      @RequestParam(required = false) Integer invoiceId) {
        if (appointmentId != null) {
            return paymentService.forAppointment(appointmentId);
        }
        if (invoiceId != null) {
            return paymentService.forInvoice(invoiceId);
        }
        throw new IllegalArgumentException("Give appointmentId or invoiceId");
    }

    @GetMapping("/{id}/slip")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Resource> slip(@PathVariable Integer id) {
        Payment p = paymentService.findForSlip(id);
        return ResponseEntity.ok().contentType(fileStorageService.mediaType(p.getSlipFile())).body(paymentService.slip(p));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public PaymentResponse verify(@PathVariable Integer id) {
        return paymentService.verify(id, staffService.currentEmployee());
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public PaymentResponse reject(@PathVariable Integer id, @Valid @RequestBody ReasonRequest request) {
        return paymentService.reject(id, request.reason(), staffService.currentEmployee());
    }
}
