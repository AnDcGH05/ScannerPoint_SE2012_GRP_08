package ScannerPoint.example.ScannerPoint.billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
}
