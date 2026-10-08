package ScannerPoint.example.ScannerPoint.user.repository;

import ScannerPoint.example.ScannerPoint.user.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Integer> {

    @Query("select u from UserAccount u where lower(u.username) = lower(:login) or lower(u.email) = lower(:login)")
    Optional<UserAccount> findByLogin(@Param("login") String usernameOrEmail);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);
}
