package ScannerPoint.example.ScannerPoint.billing.service;

import ScannerPoint.example.ScannerPoint.billing.dto.InvoiceRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.InvoiceResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.Invoice;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceItem;
import ScannerPoint.example.ScannerPoint.billing.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Invoice invoice = new Invoice();
        invoice.setCustomerId(request.getCustomerId());
        invoice.setJobCardId(request.getJobCardId());

        double total = 0.0;
        for (InvoiceRequest.ItemRequest itemReq : request.getItems()) {
            InvoiceItem item = new InvoiceItem(itemReq.getDescription(), itemReq.getAmount(), invoice);
            invoice.getItems().add(item);
            total += itemReq.getAmount();
        }

        invoice.setTotalAmount(total);
        Invoice saved = invoiceRepository.save(invoice);

        return mapToResponse(saved);
    }

    public List<InvoiceResponse> getInvoicesByCustomer(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getCustomerId(),
                invoice.getJobCardId(),
                invoice.getTotalAmount(),
                invoice.getStatus(),
                invoice.getCreatedAt()
        );
    }
}
