package ScannerPoint.example.ScannerPoint.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Catches exceptions thrown anywhere in the controllers/services and turns them
 * into a clean HTTP response with the right status code and an ApiError body.
 *
 * Without this class, every RuntimeException became "500 Internal Server Error".
 *
 * Note: we deliberately do NOT catch Exception.class here. Security exceptions
 * (AccessDeniedException from @PreAuthorize) must keep flowing to Spring Security
 * so they still become 401/403.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404 - the record does not exist
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    // 409 - duplicate / clashes with existing data
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    // 400 - breaks a business rule
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    // 400 - @Valid failed on a request DTO (blank name, bad email...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fe -> fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
        ApiError body = new ApiError(Instant.now(), 400, "Bad Request",
                "Some fields are invalid", req.getRequestURI(), fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    // 400 - the JSON body is missing or malformed (e.g. text where a number is expected)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Request body is missing or not valid JSON", req);
    }

    // 400 - a required ?param= is missing, e.g. /api/inventory/restock without partId
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Missing required parameter: " + ex.getParameterName(), req);
    }

    // 400 - a path/query value has the wrong type, e.g. /api/employees/abc
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Invalid value for parameter: " + ex.getName(), req);
    }

    // 409 - the database refused the change (unique or foreign-key constraint).
    // Safety net for duplicates the services don't check for yet (e.g. licence plate).
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT,
                "This conflicts with existing data (a duplicate value or a linked record)", req);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, HttpServletRequest req) {
        ApiError body = ApiError.of(status.value(), status.getReasonPhrase(), message, req.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
