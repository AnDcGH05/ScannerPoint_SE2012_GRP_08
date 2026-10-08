package user.dto;

import user.entity.Role;
import user.entity.UserAccount;

/** GET /api/auth/me – what the top bar needs (name and role badge). */
public record UserInfo(
        Integer id,
        String username,
        String email,
        String fullName,
        Role role) {

    public static UserInfo from(UserAccount u) {
        return new UserInfo(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole());
    }
}
