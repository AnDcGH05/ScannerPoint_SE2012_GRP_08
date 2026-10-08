package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.PartRequest;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface PartRequestRepository extends JpaRepository<PartRequest, Integer> {

    List<PartRequest> findByStatusInOrderByRequestedAtAsc(Collection<PartRequestStatus> statuses);

    List<PartRequest> findByJobCard_IdOrderByRequestedAtAsc(Integer jobCardId);

    List<PartRequest> findByJobCard_Mechanic_IdOrderByRequestedAtDesc(Integer mechanicId);

    List<PartRequest> findAllByOrderByRequestedAtDesc();

    long countByStatusIn(Collection<PartRequestStatus> statuses);
}
