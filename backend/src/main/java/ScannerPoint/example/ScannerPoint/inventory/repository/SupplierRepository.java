package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    List<Supplier> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);
}
