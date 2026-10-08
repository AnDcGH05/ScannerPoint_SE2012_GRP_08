package ScannerPoint.example.ScannerPoint.billing.pricing;

import ScannerPoint.example.ScannerPoint.billing.entity.ItemType;
import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartCategory;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartUsage;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

/**
 * FIXED package: one PACKAGE line + approved extra labour + extra parts.
 * Consumables included in the package price (oil and filters) are not charged again.
 * Example – job 1: 18,000 + 1.5 h x 2,500 + wheel bearing 8,700 = Rs. 30,450.
 */
@Component
public class FixedPackagePricing implements PricingStrategy {

    static final EnumSet<PartCategory> INCLUDED_IN_PACKAGE = EnumSet.of(PartCategory.OIL, PartCategory.FILTER);

    @Override
    public PricingType type() {
        return PricingType.FIXED;
    }

    @Override
    public List<BillLine> buildLines(ServiceType st, List<RepairTask> tasks, List<PartUsage> parts) {
        List<BillLine> lines = new ArrayList<>();
        lines.add(new BillLine(ItemType.PACKAGE, st.getName(), BigDecimal.ONE, st.getBasePrice()));
        lines.addAll(LabourLines.approvedExtraWork(st, tasks));
        for (PartUsage u : parts) {
            if (!INCLUDED_IN_PACKAGE.contains(u.getPart().getCategory())) {
                lines.add(new BillLine(ItemType.PART, u.getPart().getPartName(),
                        BigDecimal.valueOf(u.getQuantity()), u.getUnitPriceAtIssue()));
            }
        }
        return lines;
    }
}
