package ScannerPoint.example.ScannerPoint.repair.repository;

import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairTaskRepository extends JpaRepository<RepairTask, Long> {
    List<RepairTask> findByJobCardId(Long jobCardId);
}