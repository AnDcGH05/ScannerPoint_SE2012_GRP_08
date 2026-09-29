package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findBySparePartId(Long sparePartId);
}