package ScannerPoint.example.ScannerPoint.customer.dto;

import java.time.LocalDateTime;
import java.util.List;

/** One time slot pill in step 3 of the booking wizard; greyed out when no bay is free. */
public record SlotResponse(
        LocalDateTime start,
        String label,
        List<Integer> freeBays,
        boolean available) {
}
