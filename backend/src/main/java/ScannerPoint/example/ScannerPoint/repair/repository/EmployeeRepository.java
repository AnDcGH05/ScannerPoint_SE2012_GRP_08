package ScannerPoint.example.ScannerPoint.repair.repository;

import ScannerPoint.example.ScannerPoint.repair.entity.EmpRole;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    List<Employee> findAllByOrderByEmpRoleAscFirstNameAsc();

    List<Employee> findByEmpRoleAndActiveTrueOrderByFirstNameAsc(EmpRole role);
}
