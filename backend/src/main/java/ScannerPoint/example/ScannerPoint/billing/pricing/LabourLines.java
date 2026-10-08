package ScannerPoint.example.ScannerPoint.billing.pricing;

import ScannerPoint.example.ScannerPoint.billing.entity.ItemType;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import ScannerPoint.example.ScannerPoint.repair.entity.ApprovalStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import ScannerPoint.example.ScannerPoint.repair.entity.TaskStatus;

import java.util.List;

/** Shared by both strategies: extra work the customer approved, at the package labour rate. */
final class LabourLines {

    private LabourLines() {
    }

    static List<BillLine> approvedExtraWork(ServiceType st, List<RepairTask> tasks) {
        return tasks.stream()
                .filter(t -> Boolean.TRUE.equals(t.getAdditional()))
                .filter(t -> t.getApprovalStatus() == ApprovalStatus.APPROVED)
                .filter(t -> t.getTaskStatus() != TaskStatus.CANCELLED)
                .map(t -> new BillLine(ItemType.LABOUR, t.getDescription(), t.getLabourHours(), st.getLabourRate()))
                .toList();
    }
}
