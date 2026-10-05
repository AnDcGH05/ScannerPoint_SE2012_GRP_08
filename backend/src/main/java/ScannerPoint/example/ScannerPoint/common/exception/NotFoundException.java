package ScannerPoint.example.ScannerPoint.common.exception;

/**
 * Thrown when a requested record does not exist (e.g. customer id 999).
 * GlobalExceptionHandler turns it into HTTP 404 Not Found.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
