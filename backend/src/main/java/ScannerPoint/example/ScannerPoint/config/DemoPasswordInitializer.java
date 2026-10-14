package ScannerPoint.example.ScannerPoint.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DEMO ONLY (work plan step G6). The password hashes in 02_data.sql are placeholders,
 * so nobody can log in with them. Start the app once with
 *   app.demo.reset-passwords=true
 * and the sample accounts' passwords become app.demo.password (default Demo@1234).
 * Only the 17 sample accounts from 02_data.sql (user_id 1-17) are reset, so customers
 * registered on the website keep their own passwords. Then set it back to false.
 */
@Component
@ConditionalOnProperty(name = "app.demo.reset-passwords", havingValue = "true")
public class DemoPasswordInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoPasswordInitializer.class);

    /** Highest user_id inserted by 02_data.sql; accounts above it were created on the website. */
    private static final int LAST_SAMPLE_USER_ID = 17;

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final String demoPassword;

    public DemoPasswordInitializer(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder,
                                   @Value("${app.demo.password:Demo@1234}") String demoPassword) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.demoPassword = demoPassword;
    }

    @Override
    public void run(String... args) {
        int rows = jdbcTemplate.update("UPDATE user_account SET password_hash = ? WHERE user_id <= ?",
                passwordEncoder.encode(demoPassword), LAST_SAMPLE_USER_ID);
        log.warn("Demo passwords reset for {} sample accounts. Set app.demo.reset-passwords=false again.", rows);
    }
}
