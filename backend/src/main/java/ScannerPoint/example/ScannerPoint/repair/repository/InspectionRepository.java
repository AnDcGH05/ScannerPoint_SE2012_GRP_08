package ScannerPoint.example.ScannerPoint.repair.repository;

import ScannerPoint.example.ScannerPoint.repair.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    List<Inspection> findByVehicleId(Long vehicleId);
}