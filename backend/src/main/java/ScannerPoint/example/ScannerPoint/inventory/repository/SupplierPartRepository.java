package ScannerPoint.example.ScannerPoint.inventory.repository;

import ScannerPoint.example.ScannerPoint.inventory.entity.SupplierPart;
import ScannerPoint.example.ScannerPoint.inventory.entity.SupplierPartId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierPartRepository extends JpaRepository<SupplierPart, SupplierPartId> {

    List<SupplierPart> findByPart_IdOrderByUnitCostAsc(Integer partId);

    List<SupplierPart> findBySupplier_Id(Integer supplierId);

    Optional<SupplierPart> findFirstByPart_IdAndPreferredTrue(Integer partId);
}
