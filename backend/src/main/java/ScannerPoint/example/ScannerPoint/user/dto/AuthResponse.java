package ScannerPoint.example.ScannerPoint.user.dto;

/** Returned by login and register. The React app stores the token and redirects by role. */
public record AuthResponse(
        String token,
        long expiresInSeconds,
        UserInfo user) {
}
