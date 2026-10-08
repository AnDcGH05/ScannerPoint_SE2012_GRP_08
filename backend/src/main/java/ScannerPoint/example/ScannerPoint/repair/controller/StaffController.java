package ScannerPoint.example.ScannerPoint.repair.controller;

import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.repair.dto.StaffRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.StaffResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.EmpRole;
import ScannerPoint.example.ScannerPoint.repair.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;
    private final CurrentUser currentUser;

    public StaffController(StaffService staffService, CurrentUser currentUser) {
        this.staffService = staffService;
        this.currentUser = currentUser;
    }

    /** ?role=MECHANIC gives the active mechanics for the "Assign mechanic" dropdown. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public List<StaffResponse> list(@RequestParam(required = false) EmpRole role) {
        return staffService.list(role);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public StaffResponse get(@PathVariable Integer id) {
        return staffService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public StaffResponse create(@Valid @RequestBody StaffRequest request) {
        return staffService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public StaffResponse update(@PathVariable Integer id, @Valid @RequestBody StaffRequest request) {
        return staffService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public StaffResponse deactivate(@PathVariable Integer id) {
        return staffService.setActive(id, false, currentUser.id());
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public StaffResponse activate(@PathVariable Integer id) {
        return staffService.setActive(id, true, currentUser.id());
    }
}
