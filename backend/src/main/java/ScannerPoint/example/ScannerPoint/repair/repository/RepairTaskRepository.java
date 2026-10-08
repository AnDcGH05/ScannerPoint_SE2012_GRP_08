package ScannerPoint.example.ScannerPoint.repair.repository;

import ScannerPoint.example.ScannerPoint.repair.entity.ApprovalStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTaskId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RepairTaskRepository extends JpaRepository<RepairTask, RepairTaskId> {

    List<RepairTask> findByJobCardIdOrderByTaskNoAsc(Integer jobCardId);

    long countByJobCardIdAndApprovalStatus(Integer jobCardId, ApprovalStatus status);

    @Query("select coalesce(max(t.taskNo), 0) from RepairTask t where t.jobCardId = :jobCardId")
    int maxTaskNo(@Param("jobCardId") Integer jobCardId);
}
