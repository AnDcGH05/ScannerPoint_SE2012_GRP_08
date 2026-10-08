package ScannerPoint.example.ScannerPoint.common.exception;

/** Thrown when the request itself is invalid. Mapped to HTTP 400. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
