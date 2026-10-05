package ScannerPoint.example.ScannerPoint.employee.service;

import ScannerPoint.example.ScannerPoint.employee.dto.SalaryPaymentRequest;
import ScannerPoint.example.ScannerPoint.employee.dto.SalaryPaymentResponse;
import ScannerPoint.example.ScannerPoint.employee.entity.Employee;
import ScannerPoint.example.ScannerPoint.employee.entity.SalaryPayment;
import ScannerPoint.example.ScannerPoint.employee.repository.EmployeeRepository;
import ScannerPoint.example.ScannerPoint.employee.repository.SalaryPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;

@Service
public class PayrollService {

    private final SalaryPaymentRepository salaryPaymentRepository;
    private final EmployeeRepository employeeRepository;

    public PayrollService(SalaryPaymentRepository salaryPaymentRepository,
                          EmployeeRepository employeeRepository) {
        this.salaryPaymentRepository = salaryPaymentRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public SalaryPaymentResponse recordPayment(Long employeeId, SalaryPaymentRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + employeeId));

        if (!Boolean.TRUE.equals(employee.getActive())) {
            throw new BadRequestException("Cannot record a salary payment for an inactive employee.");
        }
        if (salaryPaymentRepository.existsByEmployeeIdAndPayMonth(employeeId, request.getPayMonth())) {
            throw new ConflictException("Salary for " + request.getPayMonth() + " is already recorded for this employee!");
        }

        Double amount = (request.getAmount() != null) ? request.getAmount() : employee.getMonthlySalary();
        SalaryPayment saved = salaryPaymentRepository.save(
                new SalaryPayment(employee, request.getPayMonth(), amount, request.getNotes()));
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SalaryPaymentResponse> getPaymentsForEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new NotFoundException("Employee not found with id: " + employeeId);
        }
        return salaryPaymentRepository.findByEmployeeIdOrderByPayMonthDescIdDesc(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalaryPaymentResponse> getAllPayments(String month) {
        List<SalaryPayment> payments = (month == null || month.isBlank())
                ? salaryPaymentRepository.findAllByOrderByPayMonthDescIdDesc()
                : salaryPaymentRepository.findByPayMonthOrderByIdDesc(month);
        return payments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private SalaryPaymentResponse mapToResponse(SalaryPayment p) {
        return new SalaryPaymentResponse(
                p.getId(),
                p.getEmployee().getId(),
                p.getEmployee().getFullName(),
                p.getPayMonth(),
                p.getAmount(),
                p.getPaymentDate(),
                p.getNotes()
        );
    }
}
