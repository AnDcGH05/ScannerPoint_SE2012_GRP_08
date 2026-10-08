package ScannerPoint.example.ScannerPoint.user.security;

import ScannerPoint.example.ScannerPoint.user.entity.Role;
import ScannerPoint.example.ScannerPoint.user.entity.UserAccount;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/** The logged-in user as Spring Security sees it. Authority is ROLE_CUSTOMER, ROLE_MECHANIC, ... */
public class UserPrincipal implements UserDetails {

    private final Integer id;
    private final String username;
    private final String password;
    private final Role role;
    private final String fullName;
    private final boolean active;

    public UserPrincipal(UserAccount user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.role = user.getRole();
        this.fullName = user.getFullName();
        this.active = Boolean.TRUE.equals(user.getActive());
    }

    public Integer getId() { return id; }
    public Role getRole() { return role; }
    public String getFullName() { return fullName; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return username; }
    @Override public boolean isEnabled() { return active; }
}
