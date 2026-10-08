package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface SparePartRepository extends JpaRepository<SparePart, Integer> {

    List<SparePart> findAllByOrderByPartCodeAsc();

    boolean existsByPartCodeIgnoreCase(String partCode);

    /** Reads the stock straight from the table (the triggers may have just changed it). */
    @Query(value = "SELECT quantity_in_stock FROM spare_part WHERE part_id = :id", nativeQuery = true)
    Integer currentStock(@Param("id") Integer partId);

    /** Query 3.1 – low-stock alert with the preferred supplier to re-order from. */
    @Query(value = """
            SELECT  p.part_id            AS partId,
                    p.part_code          AS partCode,
                    p.part_name          AS partName,
                    p.quantity_in_stock  AS inStock,
                    p.reorder_level      AS reorderLevel,
                    s.supplier_id        AS supplierId,
                    s.supplier_name      AS preferredSupplier,
                    s.phone_no           AS supplierPhone,
                    sp.lead_time_days    AS leadTimeDays
            FROM    spare_part p
            LEFT JOIN supplier_part sp ON sp.part_id = p.part_id AND sp.is_preferred = TRUE
            LEFT JOIN supplier s       ON s.supplier_id = sp.supplier_id
            WHERE   p.is_active = TRUE
              AND   p.quantity_in_stock <= p.reorder_level
            ORDER BY p.quantity_in_stock - p.reorder_level, p.part_code""", nativeQuery = true)
    List<LowStockRow> lowStock();

    /** Query 3.4 – one part's stock card with a running balance. */
    @Query(value = """
            SELECT  t.transaction_id                                            AS transactionId,
                    t.txn_at                                                    AS txnAt,
                    t.txn_type                                                  AS txnType,
                    t.quantity                                                  AS quantity,
                    SUM(t.quantity) OVER (ORDER BY t.txn_at, t.transaction_id)  AS balance,
                    COALESCE(s.supplier_name, t.note)                           AS details,
                    t.note                                                      AS note,
                    CONCAT(e.first_name, ' ', e.last_name)                      AS performedBy
            FROM    inventory_transaction t
            LEFT JOIN supplier s ON s.supplier_id = t.supplier_id
            LEFT JOIN employee e ON e.employee_id = t.performed_by
            WHERE   t.part_id = :id
            ORDER BY t.txn_at, t.transaction_id""", nativeQuery = true)
    List<StockCardRow> stockCard(@Param("id") Integer partId);

    /** Query 3.2 – most used parts in a month. */
    @Query(value = """
            SELECT  p.part_id                               AS partId,
                    p.part_code                             AS partCode,
                    p.part_name                             AS partName,
                    SUM(u.quantity)                         AS qtyIssued,
                    COUNT(DISTINCT u.job_card_id)           AS jobs,
                    SUM(u.quantity * u.unit_price_at_issue) AS valueIssued
            FROM    part_usage u
            JOIN    spare_part p ON p.part_id = u.part_id
            WHERE   u.issued_at >= :from AND u.issued_at < :to
            GROUP BY p.part_id, p.part_code, p.part_name
            ORDER BY qtyIssued DESC, valueIssued DESC""", nativeQuery = true)
    List<PartsUsageRow> partsUsage(@Param("from") LocalDate from, @Param("to") LocalDate to);

    /** Query 3.3 – cheapest supplier for every part. */
    @Query(value = """
            SELECT  p.part_id        AS partId,
                    p.part_name      AS partName,
                    s.supplier_name  AS cheapestSupplier,
                    sp.unit_cost     AS unitCost,
                    sp.is_preferred  AS preferred
            FROM    supplier_part sp
            JOIN    spare_part p ON p.part_id = sp.part_id
            JOIN    supplier s   ON s.supplier_id = sp.supplier_id
            WHERE   sp.unit_cost = (SELECT MIN(sp2.unit_cost) FROM supplier_part sp2 WHERE sp2.part_id = sp.part_id)
            ORDER BY p.part_id""", nativeQuery = true)
    List<CheapestSupplierRow> cheapestSuppliers();

    @Query(value = "SELECT COALESCE(SUM(quantity_in_stock * unit_price), 0) FROM spare_part WHERE is_active = TRUE",
            nativeQuery = true)
    BigDecimal stockValue();

    @Query(value = "SELECT COUNT(*) FROM inventory_transaction WHERE txn_type = 'RECEIPT' AND txn_at >= :since",
            nativeQuery = true)
    long receiptsSince(@Param("since") LocalDateTime since);

    interface LowStockRow {
        Integer getPartId();
        String getPartCode();
        String getPartName();
        Integer getInStock();
        Integer getReorderLevel();
        Integer getSupplierId();
        String getPreferredSupplier();
        String getSupplierPhone();
        Integer getLeadTimeDays();
    }

    interface StockCardRow {
        Integer getTransactionId();
        LocalDateTime getTxnAt();
        String getTxnType();
        Integer getQuantity();
        BigDecimal getBalance();
        String getDetails();
        String getNote();
        String getPerformedBy();
    }

    interface PartsUsageRow {
        Integer getPartId();
        String getPartCode();
        String getPartName();
        BigDecimal getQtyIssued();
        Long getJobs();
        BigDecimal getValueIssued();
    }

    interface CheapestSupplierRow {
        Integer getPartId();
        String getPartName();
        String getCheapestSupplier();
        BigDecimal getUnitCost();
        Boolean getPreferred();
    }
}
