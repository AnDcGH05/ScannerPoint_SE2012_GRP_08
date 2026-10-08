package ScannerPoint.example.ScannerPoint.billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceSummaryRepository extends JpaRepository<InvoiceSummary, Integer> {

    Optional<InvoiceSummary> findByJobCardId(Integer jobCardId);
}
