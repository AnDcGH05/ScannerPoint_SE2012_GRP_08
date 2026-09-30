package ScannerPoint.example.ScannerPoint.employee.service;

import ScannerPoint.example.ScannerPoint.billing.repository.PaymentRepository;
import ScannerPoint.example.ScannerPoint.employee.dto.EmployeeReportResponse;
import ScannerPoint.example.ScannerPoint.employee.dto.EmployeeReportResponse.EmployeeRow;
import ScannerPoint.example.ScannerPoint.employee.entity.Employee;
import ScannerPoint.example.ScannerPoint.employee.repository.EmployeeRepository;
import ScannerPoint.example.ScannerPoint.employee.repository.SalaryPaymentRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.repository.JobCardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmployeeReportService {

    // Job cards start as "OPEN"; a job counts as done when a mechanic sets this status
    private static final String COMPLETED_STATUS = "COMPLETED";

    private final EmployeeRepository employeeRepository;
    private final SalaryPaymentRepository salaryPaymentRepository;
    private final JobCardRepository jobCardRepository;
    private final PaymentRepository paymentRepository;

    public EmployeeReportService(EmployeeRepository employeeRepository,
                                 SalaryPaymentRepository salaryPaymentRepository,
                                 JobCardRepository jobCardRepository,
                                 PaymentRepository paymentRepository) {
        this.employeeRepository = employeeRepository;
        this.salaryPaymentRepository = salaryPaymentRepository;
        this.jobCardRepository = jobCardRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public EmployeeReportResponse generateReport() {
        List<EmployeeRow> rows = new ArrayList<>();
        double monthlyPayroll = 0.0;
        long activeCount = 0;

        for (Employee e : employeeRepository.findAll()) {
            long assigned = 0;
            long completed = 0;
            if (e.getUser() != null) {
                List<JobCard> jobs = jobCardRepository.findByMechanicId(e.getUser().getId());
                assigned = jobs.size();
                completed = jobs.stream().filter(j -> COMPLETED_STATUS.equals(j.getStatus())).count();
            }

            Double paid = salaryPaymentRepository.sumByEmployeeId(e.getId());
            rows.add(new EmployeeRow(e.getId(), e.getFullName(), e.getPosition(), e.getActive(),
                    assigned, completed, paid == null ? 0.0 : paid));

            if (Boolean.TRUE.equals(e.getActive())) {
                activeCount++;
                monthlyPayroll += e.getMonthlySalary();
            }
        }

        Double totalPaid = salaryPaymentRepository.calculateTotalPaid();
        Double revenue = paymentRepository.calculateTotalRevenue();
        double totalSalaryPaid = (totalPaid == null) ? 0.0 : totalPaid;
        double totalRevenue = (revenue == null) ? 0.0 : revenue;

        return new EmployeeReportResponse(totalRevenue, totalSalaryPaid,
                totalRevenue - totalSalaryPaid, monthlyPayroll, activeCount, rows);
    }
}
