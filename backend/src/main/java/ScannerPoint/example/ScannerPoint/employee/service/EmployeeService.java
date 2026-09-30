package ScannerPoint.example.ScannerPoint.employee.service;

import ScannerPoint.example.ScannerPoint.employee.dto.EmployeeRequest;
import ScannerPoint.example.ScannerPoint.employee.dto.EmployeeResponse;
import ScannerPoint.example.ScannerPoint.employee.entity.Employee;
import ScannerPoint.example.ScannerPoint.employee.repository.EmployeeRepository;
import ScannerPoint.example.ScannerPoint.user.entity.User;
import ScannerPoint.example.ScannerPoint.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public EmployeeService(EmployeeRepository employeeRepository, UserRepository userRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByNic(request.getNic())) {
            throw new RuntimeException("An employee with this NIC already exists!");
        }

        Employee employee = new Employee(
                request.getFullName(),
                request.getNic(),
                request.getPhone(),
                request.getEmail(),
                request.getPosition(),
                request.getHireDate(),
                request.getMonthlySalary(),
                resolveUser(request.getUserId(), null)
        );
        return mapToResponse(employeeRepository.save(employee));
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        return mapToResponse(findEmployee(id));
    }

    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = findEmployee(id);

        if (!employee.getNic().equals(request.getNic()) && employeeRepository.existsByNic(request.getNic())) {
            throw new RuntimeException("An employee with this NIC already exists!");
        }

        employee.setFullName(request.getFullName());
        employee.setNic(request.getNic());
        employee.setPhone(request.getPhone());
        employee.setEmail(request.getEmail());
        employee.setPosition(request.getPosition());
        employee.setHireDate(request.getHireDate());
        employee.setMonthlySalary(request.getMonthlySalary());
        employee.setUser(resolveUser(request.getUserId(), employee));

        return mapToResponse(employeeRepository.save(employee));
    }

    public EmployeeResponse setActive(Long id, boolean active) {
        Employee employee = findEmployee(id);
        employee.setActive(active);
        return mapToResponse(employeeRepository.save(employee));
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    // 'current' is the employee being edited (null when creating), so keeping the same link is allowed
    private User resolveUser(Long userId, Employee current) {
        if (userId == null) return null;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        boolean sameLink = current != null && current.getUser() != null
                && current.getUser().getId().equals(userId);
        if (!sameLink && employeeRepository.existsByUserId(userId)) {
            throw new RuntimeException("This user account is already linked to another employee.");
        }
        return user;
    }

    private EmployeeResponse mapToResponse(Employee e) {
        Long userId = (e.getUser() != null) ? e.getUser().getId() : null;
        String username = (e.getUser() != null) ? e.getUser().getUsername() : null;
        return new EmployeeResponse(
                e.getId(), e.getFullName(), e.getNic(), e.getPhone(), e.getEmail(),
                e.getPosition(), e.getHireDate(), e.getMonthlySalary(), e.getActive(),
                userId, username
        );
    }
}
