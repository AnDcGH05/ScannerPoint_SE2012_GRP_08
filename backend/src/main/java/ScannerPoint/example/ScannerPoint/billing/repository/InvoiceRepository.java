package ScannerPoint.example.ScannerPoint.billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.Invoice;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    Optional<Invoice> findByJobCard_Id(Integer jobCardId);

    List<Invoice> findByJobCard_Vehicle_Customer_IdAndStatusInOrderByInvoiceDateDesc(Integer customerId,
                                                                                      Collection<InvoiceStatus> statuses);

    List<Invoice> findAllByOrderByInvoiceDateDescIdDesc();

    List<Invoice> findByStatusOrderByInvoiceDateDescIdDesc(InvoiceStatus status);

    /** Highest invoice number this year, e.g. INV-2026-0007. */
    @Query(value = "SELECT MAX(invoice_no) FROM invoice WHERE invoice_no LIKE :prefix", nativeQuery = true)
    String maxInvoiceNo(@Param("prefix") String prefixLike);
}
