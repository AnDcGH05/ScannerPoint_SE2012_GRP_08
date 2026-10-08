package ScannerPoint.example.ScannerPoint.billing.controller;

import ScannerPoint.example.ScannerPoint.billing.dto.DiscountRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.GenerateInvoiceRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.InvoiceLineRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.InvoiceResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceStatus;
import ScannerPoint.example.ScannerPoint.billing.service.InvoiceService;
import ScannerPoint.example.ScannerPoint.repair.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final StaffService staffService;

    public InvoiceController(InvoiceService invoiceService, StaffService staffService) {
        this.invoiceService = invoiceService;
        this.staffService = staffService;
    }

    /** Generate the bill for a Ready job (as a DRAFT). */
    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse generate(@Valid @RequestBody GenerateInvoiceRequest request) {
        return invoiceService.generate(request, staffService.currentEmployee());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public List<InvoiceResponse> list(@RequestParam(required = false) InvoiceStatus status) {
        return invoiceService.list(status);
    }

    /** Customer: "Bills & Payments" (issued and paid bills only). */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<InvoiceResponse> mine() {
        return invoiceService.mine();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public InvoiceResponse get(@PathVariable Integer id) {
        return invoiceService.get(id);
    }

    @GetMapping("/job/{jobCardId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public InvoiceResponse forJob(@PathVariable Integer jobCardId) {
        return invoiceService.forJobCard(jobCardId);
    }

    @PostMapping("/{id}/lines")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public InvoiceResponse addLine(@PathVariable Integer id, @Valid @RequestBody InvoiceLineRequest request) {
        return invoiceService.addLine(id, request);
    }

    @DeleteMapping("/{id}/lines/{lineNo}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public InvoiceResponse removeLine(@PathVariable Integer id, @PathVariable Integer lineNo) {
        return invoiceService.removeLine(id, lineNo);
    }

    @PatchMapping("/{id}/discount")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public InvoiceResponse discount(@PathVariable Integer id, @Valid @RequestBody DiscountRequest request) {
        return invoiceService.applyDiscount(id, request);
    }

    @PatchMapping("/{id}/issue")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public InvoiceResponse issue(@PathVariable Integer id) {
        return invoiceService.issue(id);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public InvoiceResponse cancel(@PathVariable Integer id) {
        return invoiceService.cancel(id);
    }
}
