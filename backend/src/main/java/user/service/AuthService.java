package user.service;

import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.config.JwtService;
import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.repository.CustomerRepository;
import ScannerPoint.example.ScannerPoint.user.dto.AuthResponse;
import ScannerPoint.example.ScannerPoint.user.dto.LoginRequest;
import ScannerPoint.example.ScannerPoint.user.dto.RegisterRequest;
import ScannerPoint.example.ScannerPoint.user.dto.UserInfo;
import user.repository.UserAccountRepository;
import user.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AccountFactory accountFactory;
    private final UserAccountRepository userAccountRepository;
    private final CustomerRepository customerRepository;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       AccountFactory accountFactory, UserAccountRepository userAccountRepository,
                       CustomerRepository customerRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.accountFactory = accountFactory;
        this.userAccountRepository = userAccountRepository;
        this.customerRepository = customerRepository;
    }

    /** Customers create their own account online, then are logged in straight away. */
    @Transactional
    public AuthResponse register(RegisterRequest r) {
        if (r.confirmPassword() != null && !r.confirmPassword().equals(r.password())) {
            throw new BadRequestException("The two passwords do not match");
        }
        checkUnique(r.username(), r.email(), r.nic());
        Customer customer = accountFactory.createCustomer(r.firstName(), r.lastName(), r.nic(), r.email(),
                r.mobile(), r.street(), r.city(), r.postalCode(), r.username(), r.password());
        customerRepository.saveAndFlush(customer);
        UserPrincipal principal = new UserPrincipal(customer);
        return new AuthResponse(jwtService.createToken(principal), jwtService.getLifetimeSeconds(), UserInfo.from(customer));
    }

    public AuthResponse login(LoginRequest r) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(r.usernameOrEmail().trim(), r.password()));
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        UserInfo info = userAccountRepository.findById(principal.getId()).map(UserInfo::from)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return new AuthResponse(jwtService.createToken(principal), jwtService.getLifetimeSeconds(), info);
    }

    @Transactional(readOnly = true)
    public UserInfo me(Integer userId) {
        return userAccountRepository.findById(userId).map(UserInfo::from)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    /** Used by registration and by the receptionist's walk-in form. */
    public void checkUnique(String username, String email, String nic) {
        if (username != null && userAccountRepository.existsByUsernameIgnoreCase(username.trim())) {
            throw new ConflictException("That username is already taken");
        }
        if (userAccountRepository.existsByEmailIgnoreCase(email.trim())) {
            throw new ConflictException("An account with this e-mail already exists");
        }
        if (customerRepository.existsByNicIgnoreCase(nic.trim())) {
            throw new ConflictException("A customer with this NIC is already registered");
        }
    }
}
