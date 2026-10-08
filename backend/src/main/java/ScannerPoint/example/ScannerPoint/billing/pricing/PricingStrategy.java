package ScannerPoint.example.ScannerPoint.billing.pricing;

import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartUsage;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;

import java.math.BigDecimal;
import java.util.List;

/**
 * Strategy pattern: how a package is charged. FIXED packages and VARIABLE (diagnostics)
 * packages build their bills differently; InvoiceService does not need to know which one
 * it is using – PricingStrategyFactory hands it the right strategy.
 */
public interface PricingStrategy {

    PricingType type();

    /** The deposit taken when the customer books. */
    default BigDecimal depositAmount(ServiceType serviceType) {
        return serviceType.depositAmount();
    }

    List<BillLine> buildLines(ServiceType serviceType, List<RepairTask> tasks, List<PartUsage> parts);
}
