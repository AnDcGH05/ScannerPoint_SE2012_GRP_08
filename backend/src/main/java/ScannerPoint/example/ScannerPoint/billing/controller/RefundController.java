package ScannerPoint.example.ScannerPoint.billing.controller;

import ScannerPoint.example.ScannerPoint.billing.dto.RefundRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.RefundResponse;
import ScannerPoint.example.ScannerPoint.billing.service.RefundService;
import ScannerPoint.example.ScannerPoint.repair.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService refundService;
    private final StaffService staffService;

    public RefundController(RefundService refundService, StaffService staffService) {
        this.refundService = refundService;
        this.staffService = staffService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public List<RefundResponse> list() {
        return refundService.list();
    }

    @PatchMapping("/{id}/refunded")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public RefundResponse markRefunded(@PathVariable Integer id, @Valid @RequestBody RefundRequest request) {
        return refundService.markRefunded(id, request.bankReference(), staffService.currentEmployee());
    }
}
