package ScannerPoint.example.ScannerPoint.common.exception;

import java.time.Instant;
import java.util.Map;

/**
 * The single JSON shape every error response uses, so the frontend
 * only needs one way to read errors:
 *
 * {
 *   "timestamp": "2026-10-01T10:15:30Z",
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Customer not found with id: 99",
 *   "path": "/api/vehicles",
 *   "fieldErrors": { "email": "Invalid email format" }   // only for validation errors
 * }
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(Instant.now(), status, error, message, path, null);
    }
}
