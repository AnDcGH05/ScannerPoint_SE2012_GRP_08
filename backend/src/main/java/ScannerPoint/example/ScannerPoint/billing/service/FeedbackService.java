package ScannerPoint.example.ScannerPoint.billing.service;

import ScannerPoint.example.ScannerPoint.billing.dto.FeedbackRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.FeedbackResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.Feedback;
import ScannerPoint.example.ScannerPoint.billing.repository.FeedbackRepository;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.ForbiddenException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import ScannerPoint.example.ScannerPoint.repair.service.JobCardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/** One star rating per collected job; the customer can edit or delete it later. */
@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final JobCardService jobCardService;
    private final CurrentUser currentUser;

    public FeedbackService(FeedbackRepository feedbackRepository, JobCardService jobCardService, CurrentUser currentUser) {
        this.feedbackRepository = feedbackRepository;
        this.jobCardService = jobCardService;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public FeedbackResponse get(Integer jobCardId) {
        jobCardService.findVisible(jobCardId);
        return feedbackRepository.findById(jobCardId).map(FeedbackResponse::from)
                .orElseThrow(() -> new NotFoundException("No feedback for this job yet"));
    }

    @Transactional
    public FeedbackResponse create(Integer jobCardId, FeedbackRequest r) {
        JobCard jc = ownJob(jobCardId);
        if (jc.getStatus() != JobStatus.COLLECTED) {
            throw new ConflictException("You can rate the service after collecting your vehicle");
        }
        if (feedbackRepository.existsById(jobCardId)) {
            throw new ConflictException("You have already rated this service – edit your feedback instead");
        }
        Feedback f = new Feedback(jc);
        f.setRating(r.rating());
        f.setComments(blankToNull(r.comments()));
        return FeedbackResponse.from(feedbackRepository.saveAndFlush(f));
    }

    @Transactional
    public FeedbackResponse update(Integer jobCardId, FeedbackRequest r) {
        ownJob(jobCardId);
        Feedback f = feedbackRepository.findById(jobCardId)
                .orElseThrow(() -> new NotFoundException("No feedback for this job yet"));
        f.setRating(r.rating());
        f.setComments(blankToNull(r.comments()));
        f.setSubmittedAt(LocalDateTime.now());
        return FeedbackResponse.from(feedbackRepository.saveAndFlush(f));
    }

    @Transactional
    public void delete(Integer jobCardId) {
        ownJob(jobCardId);
        feedbackRepository.findById(jobCardId).ifPresent(feedbackRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> all() {
        return feedbackRepository.findAllByOrderBySubmittedAtDesc().stream().map(FeedbackResponse::from).toList();
    }

    private JobCard ownJob(Integer jobCardId) {
        JobCard jc = jobCardService.find(jobCardId);
        if (!Objects.equals(jc.getVehicle().getCustomer().getId(), currentUser.id())) {
            throw new ForbiddenException("This job belongs to another customer");
        }
        return jc;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
