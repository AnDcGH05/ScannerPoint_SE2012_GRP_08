package config;

import ScannerPoint.example.ScannerPoint.common.exception.ForbiddenException;
import ScannerPoint.example.ScannerPoint.user.entity.Role;
import ScannerPoint.example.ScannerPoint.user.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Who is calling? Used for ownership checks, e.g. a customer may only see their own
 * vehicles, bookings and bills.
 */
@Component
public class CurrentUser {

    public UserPrincipal get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ForbiddenException("Please log in");
        }
        return principal;
    }

    public Integer id() {
        return get().getId();
    }

    public Role role() {
        return get().getRole();
    }

    public boolean isCustomer() {
        return role() == Role.CUSTOMER;
    }

    public boolean is(Role... roles) {
        Role mine = role();
        for (Role r : roles) {
            if (r == mine) return true;
        }
        return false;
    }

    /** Customers may only touch their own records; staff may touch any. */
    public void checkOwnerOrStaff(Integer ownerCustomerId) {
        if (isCustomer() && !Objects.equals(id(), ownerCustomerId)) {
            throw new ForbiddenException("This record belongs to another customer");
        }
    }
}
