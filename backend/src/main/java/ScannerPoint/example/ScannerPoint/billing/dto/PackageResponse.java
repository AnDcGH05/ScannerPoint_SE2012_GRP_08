package ScannerPoint.example.ScannerPoint.billing.dto;

import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;

import java.math.BigDecimal;

/** One package card in step 1 of the booking wizard. */
public record PackageResponse(
        Integer id,
        String name,
        String includesWork,
        PricingType pricingType,
        BigDecimal basePrice,
        BigDecimal depositPercent,
        BigDecimal depositAmount,
        BigDecimal labourRate,
        Integer serviceIntervalKm,
        Integer serviceIntervalMonths,
        boolean active) {

    public static PackageResponse from(ServiceType s) {
        return new PackageResponse(s.getId(), s.getName(), s.getIncludesWork(), s.getPricingType(),
                s.getBasePrice(), s.getDepositPercent(), s.depositAmount(), s.getLabourRate(),
                s.getServiceIntervalKm(), s.getServiceIntervalMonths(), Boolean.TRUE.equals(s.getActive()));
    }
}
