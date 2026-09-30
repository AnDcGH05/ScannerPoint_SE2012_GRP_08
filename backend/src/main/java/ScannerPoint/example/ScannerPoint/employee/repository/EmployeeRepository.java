package ScannerPoint.example.ScannerPoint.employee.repository;

import ScannerPoint.example.ScannerPoint.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Boolean existsByNic(String nic);
    Boolean existsByUserId(Long userId);
}
