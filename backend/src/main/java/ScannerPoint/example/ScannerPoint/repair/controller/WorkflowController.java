package ScannerPoint.example.ScannerPoint.repair.controller;

import ScannerPoint.example.ScannerPoint.repair.dto.WorkflowResponse;
import ScannerPoint.example.ScannerPoint.repair.service.WorkflowService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** Workflow boxes for a booking card on the customer dashboard (works before check-in too). */
@RestController
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/api/appointments/{id}/workflow")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public WorkflowResponse forAppointment(@PathVariable Integer id) {
        return workflowService.forAppointment(id);
    }
}
