package ScannerPoint.example.ScannerPoint.inventory.controller;

import ScannerPoint.example.ScannerPoint.common.dto.ReasonRequest;
import ScannerPoint.example.ScannerPoint.inventory.dto.PartRequestCreate;
import ScannerPoint.example.ScannerPoint.inventory.dto.PartRequestResponse;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartRequestStatus;
import ScannerPoint.example.ScannerPoint.inventory.service.PartRequestService;
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
@RequestMapping("/api/part-requests")
public class PartRequestController {

    private final PartRequestService requestService;
    private final StaffService staffService;

    public PartRequestController(PartRequestService requestService, StaffService staffService) {
        this.requestService = requestService;
        this.staffService = staffService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MECHANIC', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PartRequestResponse create(@Valid @RequestBody PartRequestCreate request) {
        return requestService.create(request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MECHANIC', 'ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void withdraw(@PathVariable Integer id) {
        requestService.withdraw(id);
    }

    /** Tabs Pending / Issued / Rejected (?status=); ?jobCardId= for one job. Mechanics see their own. */
    @GetMapping
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN', 'MECHANIC')")
    public List<PartRequestResponse> list(@RequestParam(required = false) PartRequestStatus status,
                                          @RequestParam(required = false) Integer jobCardId) {
        return requestService.list(status, jobCardId);
    }

    @PatchMapping("/{id}/issue")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public PartRequestResponse issue(@PathVariable Integer id) {
        return requestService.issue(id, staffService.currentEmployee());
    }

    /** Reason is required, e.g. "Stock not available" or "Outdated stock – replaceable". */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public PartRequestResponse reject(@PathVariable Integer id, @Valid @RequestBody ReasonRequest request) {
        return requestService.reject(id, request.reason(), staffService.currentEmployee());
    }

    @PatchMapping("/{id}/back-order")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN')")
    public PartRequestResponse backOrder(@PathVariable Integer id) {
        return requestService.backOrder(id, staffService.currentEmployee());
    }
}
