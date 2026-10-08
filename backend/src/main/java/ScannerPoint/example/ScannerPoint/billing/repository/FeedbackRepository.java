package ScannerPoint.example.ScannerPoint.billing.repository;

import ScannerPoint.example.ScannerPoint.billing.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    List<Feedback> findAllByOrderBySubmittedAtDesc();
}
