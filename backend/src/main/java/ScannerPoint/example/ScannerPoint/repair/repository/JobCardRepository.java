package ScannerPoint.example.ScannerPoint.repair.repository;

import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {
    Optional<JobCard> findByCardNumber(String cardNumber);
    List<JobCard> findByVehicleId(Long vehicleId);
    List<JobCard> findByMechanicId(Long mechanicId);
    List<JobCard> findByStatus(String status);
}