package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.PartUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartUsageRepository extends JpaRepository<PartUsage, Integer> {

    /** Parts used on a job – Sew's bill uses these. */
    List<PartUsage> findByJobCard_IdOrderByIssuedAtAscIdAsc(Integer jobCardId);
}
