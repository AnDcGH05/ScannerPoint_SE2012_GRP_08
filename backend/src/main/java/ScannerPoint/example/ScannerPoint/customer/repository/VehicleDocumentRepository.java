package ScannerPoint.example.ScannerPoint.customer.repository;

import ScannerPoint.example.ScannerPoint.customer.entity.DocStatus;
import ScannerPoint.example.ScannerPoint.customer.entity.DocType;
import ScannerPoint.example.ScannerPoint.customer.entity.VehicleDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface VehicleDocumentRepository extends JpaRepository<VehicleDocument, Integer> {

    List<VehicleDocument> findByVehicle_IdOrderByUploadedAtDesc(Integer vehicleId);

    boolean existsByVehicle_IdAndDocTypeAndStatusAndExpiryDateGreaterThanEqual(
            Integer vehicleId, DocType docType, DocStatus status, LocalDate date);

    /** Query 1.4 – documents waiting to be verified, or verified but expiring within 30 days. */
    @Query("""
            select d from VehicleDocument d join fetch d.vehicle v join fetch v.customer
            where d.status = ScannerPoint.example.ScannerPoint.customer.entity.DocStatus.PENDING
               or (d.status = ScannerPoint.example.ScannerPoint.customer.entity.DocStatus.VERIFIED
                   and d.expiryDate <= :limit)
            order by d.status, d.uploadedAt""")
    List<VehicleDocument> findForVerification(@Param("limit") LocalDate limit);
}
