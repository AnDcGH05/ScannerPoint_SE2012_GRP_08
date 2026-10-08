package billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Integer> {

    List<ServiceType> findByActiveTrueOrderByIdAsc();

    List<ServiceType> findAllByOrderByIdAsc();

    boolean existsByNameIgnoreCase(String name);

    Optional<ServiceType> findFirstByPricingTypeAndActiveTrueOrderByIdAsc(PricingType pricingType);
}
