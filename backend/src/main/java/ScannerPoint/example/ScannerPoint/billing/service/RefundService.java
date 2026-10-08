package ScannerPoint.example.ScannerPoint.billing.service;

import ScannerPoint.example.ScannerPoint.billing.dto.RefundResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.Refund;
import ScannerPoint.example.ScannerPoint.billing.entity.RefundStatus;
import ScannerPoint.example.ScannerPoint.billing.repository.RefundRepository;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Refund rows are created by sp_cancel_appointment; the receptionist records the bank transfer. */
@Service
public class RefundService {

    private final RefundRepository refundRepository;

    public RefundService(RefundRepository refundRepository) {
        this.refundRepository = refundRepository;
    }

    @Transactional(readOnly = true)
    public List<RefundResponse> list() {
        return refundRepository.findAllPendingFirst().stream().map(RefundResponse::from).toList();
    }

    @Transactional
    public RefundResponse markRefunded(Integer id, String bankReference, Employee receptionist) {
        Refund r = refundRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Refund not found with id: " + id));
        if (r.getStatus() != RefundStatus.PENDING) {
            throw new ConflictException("This refund has already been paid");
        }
        r.markRefunded(receptionist, bankReference.trim());
        return RefundResponse.from(refundRepository.saveAndFlush(r));
    }
}
