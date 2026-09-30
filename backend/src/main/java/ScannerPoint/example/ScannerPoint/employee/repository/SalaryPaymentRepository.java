package ScannerPoint.example.ScannerPoint.employee.repository;

import ScannerPoint.example.ScannerPoint.employee.entity.SalaryPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaryPaymentRepository extends JpaRepository<SalaryPayment, Long> {
    Boolean existsByEmployeeIdAndPayMonth(Long employeeId, String payMonth);

    List<SalaryPayment> findByEmployeeIdOrderByPayMonthDescIdDesc(Long employeeId);
    List<SalaryPayment> findAllByOrderByPayMonthDescIdDesc();
    List<SalaryPayment> findByPayMonthOrderByIdDesc(String payMonth);

    @Query("SELECT SUM(s.amount) FROM SalaryPayment s")
    Double calculateTotalPaid();

    @Query("SELECT SUM(s.amount) FROM SalaryPayment s WHERE s.employee.id = :employeeId")
    Double sumByEmployeeId(@Param("employeeId") Long employeeId);
}
