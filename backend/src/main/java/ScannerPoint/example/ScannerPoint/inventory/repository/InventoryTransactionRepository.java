package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Integer> {

    /** "Latest movements" feed on the storekeeper dashboard. */
    List<InventoryTransaction> findTop20ByOrderByTxnAtDescIdDesc();
}
