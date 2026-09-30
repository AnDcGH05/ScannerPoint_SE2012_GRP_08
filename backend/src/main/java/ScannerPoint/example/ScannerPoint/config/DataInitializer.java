package ScannerPoint.example.ScannerPoint.config;

import ScannerPoint.example.ScannerPoint.user.entity.Role;
import ScannerPoint.example.ScannerPoint.user.entity.User;
import ScannerPoint.example.ScannerPoint.user.repository.RoleRepository;
import ScannerPoint.example.ScannerPoint.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Seeds the roles and a default admin on startup (only inserts what is missing).
 * DEV ONLY: change or remove the default admin before any real deployment.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        List<String> roleNames = List.of(
                "ROLE_USER", "ROLE_ADMIN", "ROLE_RECEPTIONIST", "ROLE_MECHANIC", "ROLE_STOREKEEPER");

        for (String name : roleNames) {
            if (roleRepository.findByName(name).isEmpty()) {
                roleRepository.save(new Role(name));
            }
        }

        if (!userRepository.existsByUsername("admin")) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseThrow();
            User admin = new User("admin", "admin@scannerpoint.local", passwordEncoder.encode("admin123"));
            admin.setRoles(new HashSet<>(Set.of(adminRole)));
            userRepository.save(admin);
        }
    }
}
