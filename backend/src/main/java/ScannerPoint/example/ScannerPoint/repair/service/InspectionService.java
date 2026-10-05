package ScannerPoint.example.ScannerPoint.repair.service;

import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.Inspection;
import ScannerPoint.example.ScannerPoint.repair.repository.InspectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;

@Service
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final VehicleRepository vehicleRepository;

    public InspectionService(InspectionRepository inspectionRepository, VehicleRepository vehicleRepository) {
        this.inspectionRepository = inspectionRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public Inspection createInspection(Long vehicleId, String details, String status) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + vehicleId));

        Inspection inspection = new Inspection(vehicle, details, status.toUpperCase());
        return inspectionRepository.save(inspection);
    }

    public List<Inspection> getInspectionsByVehicle(Long vehicleId) {
        return inspectionRepository.findByVehicleId(vehicleId);
    }
}