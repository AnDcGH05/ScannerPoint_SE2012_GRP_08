package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByEmail(String email);
    Boolean existsByEmail(String email);
}