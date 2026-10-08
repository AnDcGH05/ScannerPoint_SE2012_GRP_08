package ScannerPoint.example.ScannerPoint.repair.controller;

import ScannerPoint.example.ScannerPoint.repair.dto.ApprovalRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.AssignMechanicRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.CheckInRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.HistoryResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.InspectionRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.InspectionResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.JobCardDetailResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.JobCardResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.StageRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.TaskRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.TaskResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.WorkflowResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import ScannerPoint.example.ScannerPoint.repair.service.JobCardService;
import ScannerPoint.example.ScannerPoint.repair.service.RepairTaskService;
import ScannerPoint.example.ScannerPoint.repair.service.WorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/jobcards")
public class JobCardController {

    private final JobCardService jobCardService;
    private final RepairTaskService taskService;
    private final WorkflowService workflowService;

    public JobCardController(JobCardService jobCardService, RepairTaskService taskService,
                             WorkflowService workflowService) {
        this.jobCardService = jobCardService;
        this.taskService = taskService;
        this.workflowService = workflowService;
    }

    /** Check in a confirmed booking or a walk-in. */
    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public JobCardResponse checkIn(@Valid @RequestBody CheckInRequest request) {
        return jobCardService.checkIn(request);
    }

    /** Job board (all open jobs) or one column with ?status=. */
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'MECHANIC', 'STOREKEEPER')")
    public List<JobCardResponse> list(@RequestParam(required = false) JobStatus status) {
        return jobCardService.list(status);
    }

    /** Mechanic dashboard: "My jobs". */
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('MECHANIC')")
    public List<JobCardResponse> assigned() {
        return jobCardService.assignedToMe();
    }

    /** Customer: jobs for my vehicles. */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<JobCardResponse> mine() {
        return jobCardService.mine();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC', 'STOREKEEPER')")
    public JobCardDetailResponse detail(@PathVariable Integer id) {
        return jobCardService.detail(id);
    }

    @PatchMapping("/{id}/mechanic")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public JobCardResponse assignMechanic(@PathVariable Integer id, @Valid @RequestBody AssignMechanicRequest request) {
        return jobCardService.assignMechanic(id, request.mechanicId());
    }

    /** Next-stage buttons: "Send for approval", "Start repair", "Move to quality check", "Mark ready", ... */
    @PatchMapping("/{id}/stage")
    @PreAuthorize("hasAnyRole('MECHANIC', 'ADMIN')")
    public JobCardResponse moveTo(@PathVariable Integer id, @Valid @RequestBody StageRequest request) {
        return jobCardService.moveTo(id, request);
    }

    /** Ready -> Collected; refused while the bill has a balance. */
    @PostMapping("/{id}/release")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public JobCardResponse release(@PathVariable Integer id) {
        return jobCardService.release(id);
    }

    @GetMapping("/{id}/workflow")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public WorkflowResponse workflow(@PathVariable Integer id) {
        return workflowService.forJobCard(id);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public List<HistoryResponse> history(@PathVariable Integer id) {
        return jobCardService.history(id);
    }

    @GetMapping("/{id}/inspection")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public InspectionResponse inspection(@PathVariable Integer id) {
        return jobCardService.inspection(id);
    }

    @PutMapping("/{id}/inspection")
    @PreAuthorize("hasAnyRole('MECHANIC', 'ADMIN')")
    public InspectionResponse saveInspection(@PathVariable Integer id, @Valid @RequestBody InspectionRequest request) {
        return jobCardService.saveInspection(id, request);
    }

    @GetMapping("/{id}/tasks")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public List<TaskResponse> tasks(@PathVariable Integer id) {
        return taskService.list(id);
    }

    @PostMapping("/{id}/tasks")
    @PreAuthorize("hasAnyRole('MECHANIC', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse addTask(@PathVariable Integer id, @Valid @RequestBody TaskRequest request) {
        return taskService.add(id, request);
    }

    @PutMapping("/{id}/tasks/{taskNo}")
    @PreAuthorize("hasAnyRole('MECHANIC', 'ADMIN')")
    public TaskResponse updateTask(@PathVariable Integer id, @PathVariable Integer taskNo,
                                   @Valid @RequestBody TaskRequest request) {
        return taskService.update(id, taskNo, request);
    }

    @DeleteMapping("/{id}/tasks/{taskNo}")
    @PreAuthorize("hasAnyRole('MECHANIC', 'ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Integer id, @PathVariable Integer taskNo) {
        taskService.delete(id, taskNo);
    }

    /** Customer approves or rejects one piece of extra work. */
    @PatchMapping("/{id}/tasks/{taskNo}/approval")
    @PreAuthorize("hasRole('CUSTOMER')")
    public TaskResponse answer(@PathVariable Integer id, @PathVariable Integer taskNo,
                               @Valid @RequestBody ApprovalRequest request) {
        return taskService.answer(id, taskNo, request.approved());
    }
}
