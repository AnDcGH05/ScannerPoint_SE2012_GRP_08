package ScannerPoint.example.ScannerPoint.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Turns every exception into the same {@link ApiError} JSON.
 *
 * Database rules: our MySQL triggers raise SQLSTATE 45000 with a readable message
 * (e.g. "Deposit has not been verified"), and CHECK / UNIQUE / FK constraints raise
 * SQLSTATE 23xxx or error 3819. Both are returned as 409 Conflict with the message,
 * so the front end can show exactly why the database refused the action.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> notFound(NotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> badRequest(BadRequestException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> conflict(ConflictException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiError> forbidden(ForbiddenException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), req);
    }

    /** @PreAuthorize failures must be 403, not fall through to the 500 handler below. */
    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ApiError> accessDenied(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "You do not have permission to do this", req);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> unauthenticated(AuthenticationException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Wrong username or password", req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        ApiError body = new ApiError(LocalDateTime.now(), 400, "Bad Request",
                "Please correct the highlighted fields", req.getRequestURI(), fields);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class, MissingServletRequestPartException.class,
            IllegalArgumentException.class})
    public ResponseEntity<ApiError> unreadable(Exception ex, HttpServletRequest req) {
        String msg = (ex instanceof IllegalArgumentException) ? ex.getMessage() : "The request is missing a value or has a value in the wrong format";
        return build(HttpStatus.BAD_REQUEST, msg, req);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> tooLarge(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "The file is larger than 5 MB", req);
    }

    /** Anything else: check whether the database refused it, otherwise 500. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> other(Exception ex, HttpServletRequest req) {
        SQLException sql = findSqlException(ex);
        if (sql != null) {
            String state = sql.getSQLState();
            if ("45000".equals(state)) {
                // message written by one of our triggers or the cancel procedure
                return build(HttpStatus.CONFLICT, sql.getMessage(), req);
            }
            if ((state != null && state.startsWith("23")) || sql.getErrorCode() == 3819) {
                return build(HttpStatus.CONFLICT, friendlyConstraintMessage(sql.getMessage()), req);
            }
        }
        log.error("Unexpected error on {}", req.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong on the server", req);
    }

    public static SQLException findSqlException(Throwable ex) {
        Throwable t = ex;
        while (t != null) {
            if (t instanceof SQLException s) {
                return s;
            }
            t = t.getCause();
        }
        return null;
    }

    private static String friendlyConstraintMessage(String raw) {
        if (raw == null) {
            return "The database refused this change";
        }
        if (raw.contains("Duplicate entry")) {
            return "This value is already in use: " + raw.replaceAll(".*Duplicate entry '([^']*)'.*", "$1");
        }
        if (raw.contains("Check constraint")) {
            String name = raw.replaceAll(".*Check constraint '([^']*)'.*", "$1");
            return "The value breaks the database rule " + name;
        }
        if (raw.contains("foreign key constraint fails")) {
            return "This record is still used by other records";
        }
        return "The database refused this change";
    }

    private static ResponseEntity<ApiError> build(HttpStatus status, String message, HttpServletRequest req) {
        return ResponseEntity.status(status)
                .body(ApiError.of(status.value(), status.getReasonPhrase(), message, req.getRequestURI()));
    }
}
