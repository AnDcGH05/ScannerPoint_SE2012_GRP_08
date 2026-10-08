package ScannerPoint.example.ScannerPoint.billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Integer> {

    /** Pending refunds first, newest first. */
    @Query("select r from Refund r order by case when r.status = ScannerPoint.example.ScannerPoint.billing.entity.RefundStatus.PENDING then 0 else 1 end, r.createdAt desc")
    List<Refund> findAllPendingFirst();
}
