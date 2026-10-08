package ScannerPoint.example.ScannerPoint.billing.controller;

import ScannerPoint.example.ScannerPoint.billing.dto.FeedbackRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.FeedbackResponse;
import ScannerPoint.example.ScannerPoint.billing.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping("/api/jobcards/{id}/feedback")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public FeedbackResponse get(@PathVariable Integer id) {
        return feedbackService.get(id);
    }

    @PostMapping("/api/jobcards/{id}/feedback")
    @PreAuthorize("hasRole('CUSTOMER')")
    @ResponseStatus(HttpStatus.CREATED)
    public FeedbackResponse create(@PathVariable Integer id, @Valid @RequestBody FeedbackRequest request) {
        return feedbackService.create(id, request);
    }

    @PutMapping("/api/jobcards/{id}/feedback")
    @PreAuthorize("hasRole('CUSTOMER')")
    public FeedbackResponse update(@PathVariable Integer id, @Valid @RequestBody FeedbackRequest request) {
        return feedbackService.update(id, request);
    }

    @DeleteMapping("/api/jobcards/{id}/feedback")
    @PreAuthorize("hasRole('CUSTOMER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        feedbackService.delete(id);
    }

    /** Admin list: stars, comment, vehicle, mechanic and date. */
    @GetMapping("/api/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public List<FeedbackResponse> all() {
        return feedbackService.all();
    }
}
