package ScannerPoint.example.ScannerPoint.common.exception;

/**
 * Thrown when a request clashes with existing data
 * (duplicate username, NIC already used, salary already paid for that month...).
 * GlobalExceptionHandler turns it into HTTP 409 Conflict.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
