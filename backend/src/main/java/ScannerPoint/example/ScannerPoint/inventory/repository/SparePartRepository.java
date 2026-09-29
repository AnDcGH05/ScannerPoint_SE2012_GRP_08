package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    Optional<SparePart> findByPartNumber(String partNumber);
    Boolean existsByPartNumber(String partNumber);

    @Query("SELECT s FROM SparePart s WHERE s.quantityInStock <= s.reorderLevel")
    List<SparePart> findLowStockParts();
}