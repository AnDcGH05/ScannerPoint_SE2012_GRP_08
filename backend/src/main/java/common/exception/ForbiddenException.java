package common.exception;

/** Thrown when a logged-in user touches a record that is not theirs. Mapped to HTTP 403. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
