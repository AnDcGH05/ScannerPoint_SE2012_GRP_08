package ScannerPoint.example.ScannerPoint.repair;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MECHANIC')")
    public ResponseEntity<Inspection> createInspection(@RequestParam Long vehicleId,
                                                       @RequestParam String details,
                                                       @RequestParam String status) {
        return new ResponseEntity<>(inspectionService.createInspection(vehicleId, details, status), HttpStatus.CREATED);
    }

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MECHANIC', 'RECEPTIONIST', 'CUSTOMER')")
    public ResponseEntity<List<Inspection>> getInspectionsByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(inspectionService.getInspectionsByVehicle(vehicleId));
    }
}