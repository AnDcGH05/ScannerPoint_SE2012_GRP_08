package ScannerPoint.example.ScannerPoint.billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceItem;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, InvoiceItemId> {

    List<InvoiceItem> findByInvoiceIdOrderByLineNoAsc(Integer invoiceId);

    @Query("select coalesce(max(i.lineNo), 0) from InvoiceItem i where i.invoiceId = :invoiceId")
    int maxLineNo(@Param("invoiceId") Integer invoiceId);
}
