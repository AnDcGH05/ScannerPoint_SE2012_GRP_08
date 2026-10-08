package ScannerPoint.example.ScannerPoint.repair.service;

import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.ForbiddenException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.repair.dto.StaffRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.StaffResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.EmpRole;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import ScannerPoint.example.ScannerPoint.repair.repository.EmployeeRepository;
import ScannerPoint.example.ScannerPoint.user.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/** Admin staff management (Stitch S5). Delete = deactivate, so history stays intact. */
@Service
public class StaffService {

    private final EmployeeRepository employeeRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUser currentUser;

    public StaffService(EmployeeRepository employeeRepository, UserAccountRepository userAccountRepository,
                        PasswordEncoder passwordEncoder, CurrentUser currentUser) {
        this.employeeRepository = employeeRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUser = currentUser;
    }

    /** The logged-in staff member (used to fill verified_by, handled_by, issued_by ...). */
    @Transactional(readOnly = true)
    public Employee currentEmployee() {
        return employeeRepository.findById(currentUser.id())
                .orElseThrow(() -> new ForbiddenException("Only staff can do this"));
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> list(EmpRole role) {
        List<Employee> staff = (role == null)
                ? employeeRepository.findAllByOrderByEmpRoleAscFirstNameAsc()
                : employeeRepository.findByEmpRoleAndActiveTrueOrderByFirstNameAsc(role);
        return staff.stream().map(StaffResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public StaffResponse get(Integer id) {
        return StaffResponse.from(find(id));
    }

    @Transactional
    public StaffResponse create(StaffRequest r) {
        if (r.username() == null || r.username().isBlank()) {
            throw new BadRequestException("Username is required");
        }
        if (r.temporaryPassword() == null || r.temporaryPassword().isBlank()) {
            throw new BadRequestException("Temporary password is required");
        }
        if (userAccountRepository.existsByUsernameIgnoreCase(r.username().trim())) {
            throw new ConflictException("That username is already taken");
        }
        if (userAccountRepository.existsByEmailIgnoreCase(r.email().trim())) {
            throw new ConflictException("An account with this e-mail already exists");
        }
        Employee e = new Employee();
        e.setUsername(r.username().trim());
        e.setPasswordHash(passwordEncoder.encode(r.temporaryPassword()));
        e.setActive(true);
        apply(e, r);
        return StaffResponse.from(employeeRepository.saveAndFlush(e));
    }

    @Transactional
    public StaffResponse update(Integer id, StaffRequest r) {
        Employee e = find(id);
        if (!e.getEmail().equalsIgnoreCase(r.email().trim())
                && userAccountRepository.existsByEmailIgnoreCase(r.email().trim())) {
            throw new ConflictException("An account with this e-mail already exists");
        }
        apply(e, r);
        if (r.temporaryPassword() != null && !r.temporaryPassword().isBlank()) {
            e.setPasswordHash(passwordEncoder.encode(r.temporaryPassword()));
        }
        return StaffResponse.from(employeeRepository.saveAndFlush(e));
    }

    @Transactional
    public StaffResponse setActive(Integer id, boolean active, Integer currentUserId) {
        Employee e = find(id);
        if (!active && Objects.equals(id, currentUserId)) {
            throw new ConflictException("You cannot deactivate your own account");
        }
        e.setActive(active);
        return StaffResponse.from(e);
    }

    private void apply(Employee e, StaffRequest r) {
        e.setFirstName(r.firstName().trim());
        e.setLastName(r.lastName().trim());
        e.setEmpRole(r.role());
        e.setPhoneNo(r.phoneNo());
        e.setHireDate(r.hireDate());
        e.setEmail(r.email().trim().toLowerCase());
        if (r.role() == EmpRole.MECHANIC) {
            // chk_employee_mechanic: a mechanic must have an hourly rate
            if (r.hourlyRate() == null) {
                throw new BadRequestException("A mechanic needs an hourly rate");
            }
            e.setHourlyRate(r.hourlyRate());
            e.setSpecialization(r.specialization() == null || r.specialization().isBlank() ? null : r.specialization().trim());
        } else {
            e.setHourlyRate(null);
            e.setSpecialization(null);
        }
    }

    private Employee find(Integer id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Staff member not found with id: " + id));
    }
}
