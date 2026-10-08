package ScannerPoint.example.ScannerPoint.billing;

import ScannerPoint.example.ScannerPoint.billing.entity.ItemType;
import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import ScannerPoint.example.ScannerPoint.billing.pricing.BillLine;
import ScannerPoint.example.ScannerPoint.billing.pricing.FixedPackagePricing;
import ScannerPoint.example.ScannerPoint.billing.pricing.PricingStrategyFactory;
import ScannerPoint.example.ScannerPoint.billing.pricing.VariableDiagnosticPricing;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartCategory;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartUsage;
import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import ScannerPoint.example.ScannerPoint.repair.entity.ApprovalStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import ScannerPoint.example.ScannerPoint.repair.entity.TaskStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

/** Strategy pattern: the two sample bills from 02_data.sql (work plan, Sew T1). */
class PricingStrategyTest {

    private final PricingStrategyFactory factory =
            new PricingStrategyFactory(List.of(new FixedPackagePricing(), new VariableDiagnosticPricing()));

    @Test
    void factoryPicksTheRightStrategy() {
        assertInstanceOf(FixedPackagePricing.class, factory.forType(PricingType.FIXED));
        assertInstanceOf(VariableDiagnosticPricing.class, factory.forType(PricingType.VARIABLE));
    }

    /** Job 1: 18,000 + 1.5 h x 2,500 + wheel bearing 8,700 = 30,450 (oil and filters are in the package). */
    @Test
    void fixedPackageJob1() {
        ServiceType full = pkg("Full Service + Cleanup", PricingType.FIXED, "18000.00", "2500.00");
        List<RepairTask> tasks = List.of(
                task(1, "Full service + cleanup", "3.0", false, ApprovalStatus.NOT_REQUIRED),
                task(2, "Replace front-left wheel bearing", "1.5", true, ApprovalStatus.APPROVED));
        List<PartUsage> parts = List.of(
                usage("Engine Oil 5W-30 (4 L)", PartCategory.OIL, "9500.00", 1),
                usage("Oil Filter (standard)", PartCategory.FILTER, "1800.00", 1),
                usage("Air Filter (standard)", PartCategory.FILTER, "2600.00", 1),
                usage("Front Wheel Bearing", PartCategory.SUSPENSION, "8700.00", 1));

        List<BillLine> lines = factory.forType(PricingType.FIXED).buildLines(full, tasks, parts);

        assertEquals(3, lines.size());
        assertEquals(ItemType.PACKAGE, lines.get(0).itemType());
        assertEquals(0, new BigDecimal("30450.00").compareTo(total(lines)));
        assertEquals(0, new BigDecimal("9000.00").compareTo(factory.forType(PricingType.FIXED).depositAmount(full)));
    }

    /** Job 4: 5,000 + 3 h x 3,000 + EGR valve 42,000 + oil 14,800 = 70,800; the rejected gasket is not billed. */
    @Test
    void variableDiagnosticsJob4() {
        ServiceType diag = pkg("Diagnostics + Specific Repairs", PricingType.VARIABLE, "5000.00", "3000.00");
        RepairTask rejected = task(3, "Replace intake manifold gasket", "0.5", true, ApprovalStatus.REJECTED);
        rejected.setTaskStatus(TaskStatus.CANCELLED);
        List<RepairTask> tasks = List.of(
                task(1, "Diagnostic scan and road test", "1.5", false, ApprovalStatus.NOT_REQUIRED),
                task(2, "Replace EGR valve", "3.0", true, ApprovalStatus.APPROVED),
                rejected);
        List<PartUsage> parts = List.of(
                usage("EGR Valve - Mitsubishi", PartCategory.ENGINE, "42000.00", 1),
                usage("Diesel Engine Oil 15W-40 (7 L)", PartCategory.OIL, "14800.00", 1));

        List<BillLine> lines = factory.forType(PricingType.VARIABLE).buildLines(diag, tasks, parts);

        assertEquals(ItemType.DIAGNOSTIC_FEE, lines.get(0).itemType());
        assertEquals(4, lines.size());
        assertEquals(0, new BigDecimal("70800.00").compareTo(total(lines)));
        assertEquals(0, new BigDecimal("2500.00").compareTo(factory.forType(PricingType.VARIABLE).depositAmount(diag)));
    }

    private static BigDecimal total(List<BillLine> lines) {
        return lines.stream().map(l -> l.quantity().multiply(l.unitPrice())).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static ServiceType pkg(String name, PricingType type, String price, String labourRate) {
        ServiceType s = new ServiceType();
        s.setName(name);
        s.setPricingType(type);
        s.setBasePrice(new BigDecimal(price));
        s.setDepositPercent(new BigDecimal("50.00"));
        s.setLabourRate(new BigDecimal(labourRate));
        return s;
    }

    private static RepairTask task(int no, String description, String hours, boolean additional, ApprovalStatus approval) {
        RepairTask t = new RepairTask(1, no, description, new BigDecimal(hours), additional);
        t.setApprovalStatus(approval);
        t.setTaskStatus(TaskStatus.DONE);
        return t;
    }

    private static PartUsage usage(String name, PartCategory category, String price, int qty) {
        SparePart p = new SparePart();
        p.setPartName(name);
        p.setCategory(category);
        p.setUnitPrice(new BigDecimal(price));
        return new PartUsage(null, p, qty, null);
    }
}
