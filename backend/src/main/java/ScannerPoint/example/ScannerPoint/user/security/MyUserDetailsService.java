package ScannerPoint.example.ScannerPoint.user.security;

import ScannerPoint.example.ScannerPoint.user.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Loads a user by username or e-mail (login) or by id (every request with a JWT). */
@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    public MyUserDetailsService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserPrincipal loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        return userAccountRepository.findByLogin(usernameOrEmail.trim())
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserPrincipal loadUserById(Integer id) {
        return userAccountRepository.findById(id)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
