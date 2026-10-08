package ScannerPoint.example.ScannerPoint.billing.pricing;

import ScannerPoint.example.ScannerPoint.billing.entity.ItemType;
import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartUsage;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * VARIABLE (diagnostics) package: DIAGNOSTIC_FEE line + all approved repair labour + every
 * part used. Example – job 4: 5,000 + 3 h x 3,000 + 42,000 + 14,800 = Rs. 70,800.
 */
@Component
public class VariableDiagnosticPricing implements PricingStrategy {

    @Override
    public PricingType type() {
        return PricingType.VARIABLE;
    }

    @Override
    public List<BillLine> buildLines(ServiceType st, List<RepairTask> tasks, List<PartUsage> parts) {
        List<BillLine> lines = new ArrayList<>();
        lines.add(new BillLine(ItemType.DIAGNOSTIC_FEE, st.getName(), BigDecimal.ONE, st.getBasePrice()));
        lines.addAll(LabourLines.approvedExtraWork(st, tasks));
        for (PartUsage u : parts) {
            lines.add(new BillLine(ItemType.PART, u.getPart().getPartName(),
                    BigDecimal.valueOf(u.getQuantity()), u.getUnitPriceAtIssue()));
        }
        return lines;
    }
}
