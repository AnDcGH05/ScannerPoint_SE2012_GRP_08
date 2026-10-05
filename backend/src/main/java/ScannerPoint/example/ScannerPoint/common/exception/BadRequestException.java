package ScannerPoint.example.ScannerPoint.common.exception;

/**
 * Thrown when a request is well-formed but breaks a business rule
 * (not enough stock, paying an inactive employee...).
 * GlobalExceptionHandler turns it into HTTP 400 Bad Request.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
