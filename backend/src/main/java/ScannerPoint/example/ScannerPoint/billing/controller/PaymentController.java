package ScannerPoint.example.ScannerPoint.billing.controller;

import ScannerPoint.example.ScannerPoint.billing.dto.PaymentRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.PaymentResponse;
import ScannerPoint.example.ScannerPoint.billing.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        return new ResponseEntity<>(paymentService.processPayment(request), HttpStatus.CREATED);
    }
}