package ScannerPoint.example.ScannerPoint.billing.service;

import ScannerPoint.example.ScannerPoint.billing.dto.PackageRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.PackageResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import ScannerPoint.example.ScannerPoint.billing.repository.ServiceTypeRepository;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PackageService {

    private final ServiceTypeRepository serviceTypeRepository;

    public PackageService(ServiceTypeRepository serviceTypeRepository) {
        this.serviceTypeRepository = serviceTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<PackageResponse> list(boolean includeInactive) {
        List<ServiceType> types = includeInactive
                ? serviceTypeRepository.findAllByOrderByIdAsc()
                : serviceTypeRepository.findByActiveTrueOrderByIdAsc();
        return types.stream().map(PackageResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PackageResponse get(Integer id) {
        return PackageResponse.from(find(id));
    }

    /** Used by the booking service: the deposit for the chosen package. */
    @Transactional(readOnly = true)
    public BigDecimal depositAmount(Integer serviceTypeId) {
        return find(serviceTypeId).depositAmount();
    }

    public ServiceType find(Integer id) {
        return serviceTypeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Package not found with id: " + id));
    }

    @Transactional
    public PackageResponse create(PackageRequest r) {
        if (serviceTypeRepository.existsByNameIgnoreCase(r.name().trim())) {
            throw new ConflictException("A package with this name already exists");
        }
        ServiceType s = new ServiceType();
        apply(s, r);
        s.setActive(true);
        return PackageResponse.from(serviceTypeRepository.saveAndFlush(s));
    }

    @Transactional
    public PackageResponse update(Integer id, PackageRequest r) {
        ServiceType s = find(id);
        if (!s.getName().equalsIgnoreCase(r.name().trim()) && serviceTypeRepository.existsByNameIgnoreCase(r.name().trim())) {
            throw new ConflictException("A package with this name already exists");
        }
        apply(s, r);
        return PackageResponse.from(serviceTypeRepository.saveAndFlush(s));
    }

    /** Delete = deactivate: old bookings and bills still point at the package. */
    @Transactional
    public PackageResponse setActive(Integer id, boolean active) {
        ServiceType s = find(id);
        s.setActive(active);
        return PackageResponse.from(s);
    }

    private static void apply(ServiceType s, PackageRequest r) {
        s.setName(r.name().trim());
        s.setIncludesWork(r.includesWork().trim());
        s.setPricingType(r.pricingType());
        s.setBasePrice(r.basePrice());
        s.setDepositPercent(r.depositPercent());
        s.setLabourRate(r.labourRate());
        s.setServiceIntervalKm(r.serviceIntervalKm());
        s.setServiceIntervalMonths(r.serviceIntervalMonths());
    }
}
