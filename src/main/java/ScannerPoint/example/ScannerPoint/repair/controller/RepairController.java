package ScannerPoint.example.ScannerPoint.repair.controller;

import ScannerPoint.example.ScannerPoint.repair.dto.JobCardResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.RepairRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.RepairResponse;
import ScannerPoint.example.ScannerPoint.repair.service.RepairService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

    private final RepairService repairService;

    public RepairController(RepairService repairService) {
        this.repairService = repairService;
    }

    @PostMapping("/job-cards")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MECHANIC')")
    public ResponseEntity<RepairResponse> createJobCard(@Valid @RequestBody RepairRequest request) {
        return new ResponseEntity<>(repairService.createJobCard(request), HttpStatus.CREATED);
    }

    @GetMapping("/job-cards")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MECHANIC')")
    public ResponseEntity<List<JobCardResponse>> getAllJobCards() {
        return ResponseEntity.ok(repairService.getAllJobCards());
    }

    @PatchMapping("/job-cards/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MECHANIC')")
    public ResponseEntity<RepairResponse> updateJobCardStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(repairService.updateJobCardStatus(id, status));
    }
}