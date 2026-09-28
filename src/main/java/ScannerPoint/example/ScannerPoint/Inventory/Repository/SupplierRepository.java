package ScannerPoint.example.ScannerPoint.Inventory.Repository;

import ScannerPoint.example.ScannerPoint.Inventory.Entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByEmail(String email);
    Boolean existsByEmail(String email);
}