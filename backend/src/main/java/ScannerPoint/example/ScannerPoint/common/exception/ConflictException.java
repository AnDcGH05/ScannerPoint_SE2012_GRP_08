package ScannerPoint.example.ScannerPoint.common.exception;

/** Thrown when a business rule refuses the action (e.g. wrong workflow stage). Mapped to HTTP 409. */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
