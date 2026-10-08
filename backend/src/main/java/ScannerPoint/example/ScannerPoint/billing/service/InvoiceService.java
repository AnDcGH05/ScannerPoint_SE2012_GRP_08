package ScannerPoint.example.ScannerPoint.billing.service;

import ScannerPoint.example.ScannerPoint.billing.dto.DiscountRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.GenerateInvoiceRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.InvoiceLineRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.InvoiceLineResponse;
import ScannerPoint.example.ScannerPoint.billing.dto.InvoiceResponse;
import ScannerPoint.example.ScannerPoint.billing.entity.Invoice;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceItem;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceStatus;
import ScannerPoint.example.ScannerPoint.billing.entity.InvoiceSummary;
import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import ScannerPoint.example.ScannerPoint.billing.entity.ServiceType;
import ScannerPoint.example.ScannerPoint.billing.pricing.BillLine;
import ScannerPoint.example.ScannerPoint.billing.pricing.PricingStrategyFactory;
import ScannerPoint.example.ScannerPoint.billing.repository.InvoiceItemRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.InvoiceRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.InvoiceSummaryRepository;
import ScannerPoint.example.ScannerPoint.billing.repository.ServiceTypeRepository;
import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.ForbiddenException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.inventory.repository.PartUsageRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import ScannerPoint.example.ScannerPoint.repair.repository.RepairTaskRepository;
import ScannerPoint.example.ScannerPoint.repair.service.JobCardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;

/**
 * Bills: generated from a Ready job card with the pricing strategy of its package,
 * edited while DRAFT (extra lines, discount), then issued to the customer.
 */
@Service
public class InvoiceService {

    private static final EnumSet<InvoiceStatus> VISIBLE_TO_CUSTOMER = EnumSet.of(InvoiceStatus.ISSUED, InvoiceStatus.PAID);

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository itemRepository;
    private final InvoiceSummaryRepository summaryRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final RepairTaskRepository taskRepository;
    private final PartUsageRepository partUsageRepository;
    private final JobCardService jobCardService;
    private final PricingStrategyFactory pricingStrategyFactory;
    private final CurrentUser currentUser;

    public InvoiceService(InvoiceRepository invoiceRepository, InvoiceItemRepository itemRepository,
                          InvoiceSummaryRepository summaryRepository, ServiceTypeRepository serviceTypeRepository,
                          RepairTaskRepository taskRepository, PartUsageRepository partUsageRepository,
                          JobCardService jobCardService, PricingStrategyFactory pricingStrategyFactory,
                          CurrentUser currentUser) {
        this.invoiceRepository = invoiceRepository;
        this.itemRepository = itemRepository;
        this.summaryRepository = summaryRepository;
        this.serviceTypeRepository = serviceTypeRepository;
        this.taskRepository = taskRepository;
        this.partUsageRepository = partUsageRepository;
        this.jobCardService = jobCardService;
        this.pricingStrategyFactory = pricingStrategyFactory;
        this.currentUser = currentUser;
    }

    /** Builds the bill lines with the package's pricing strategy (Strategy pattern). */
    @Transactional
    public InvoiceResponse generate(GenerateInvoiceRequest r, Employee receptionist) {
        JobCard jc = jobCardService.find(r.jobCardId());
        if (jc.getStatus() != JobStatus.READY) {
            throw new ConflictException("A bill can only be generated when the vehicle is Ready");
        }
        Invoice invoice = invoiceRepository.findByJobCard_Id(jc.getId()).orElse(null);
        if (invoice != null && invoice.getStatus() != InvoiceStatus.CANCELLED) {
            throw new ConflictException("This job already has bill " + invoice.getInvoiceNo());
        }
        if (invoice == null) {
            invoice = new Invoice();
            invoice.setJobCard(jc);
            invoice.setInvoiceNo(nextInvoiceNo());
        } else {
            // a cancelled draft is rebuilt (one bill per job card: uq_invoice_job)
            itemRepository.deleteAll(itemRepository.findByInvoiceIdOrderByLineNoAsc(invoice.getId()));
            itemRepository.flush();
        }
        LocalDate today = LocalDate.now();
        invoice.setIssuedBy(receptionist);
        invoice.setInvoiceDate(today);
        invoice.setDiscount(BigDecimal.ZERO);
        invoice.setTaxRate(BigDecimal.ZERO);
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setWarrantyUntil(r.warrantyMonths() == null || r.warrantyMonths() == 0 ? null : today.plusMonths(r.warrantyMonths()));
        invoiceRepository.saveAndFlush(invoice);

        ServiceType st = packageFor(jc);
        List<BillLine> lines = pricingStrategyFactory.forType(st.getPricingType()).buildLines(st,
                taskRepository.findByJobCardIdOrderByTaskNoAsc(jc.getId()),
                partUsageRepository.findByJobCard_IdOrderByIssuedAtAscIdAsc(jc.getId()));
        int lineNo = 1;
        for (BillLine l : lines) {
            itemRepository.save(new InvoiceItem(invoice.getId(), lineNo++, l.itemType(), l.description(),
                    l.quantity(), l.unitPrice()));
        }
        itemRepository.flush();
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse addLine(Integer id, InvoiceLineRequest r) {
        Invoice inv = draft(id);
        itemRepository.saveAndFlush(new InvoiceItem(id, itemRepository.maxLineNo(id) + 1, r.itemType(),
                r.description().trim(), r.quantity(), r.unitPrice()));
        return toResponse(inv);
    }

    @Transactional
    public InvoiceResponse removeLine(Integer id, Integer lineNo) {
        Invoice inv = draft(id);
        InvoiceItem item = itemRepository.findByInvoiceIdOrderByLineNoAsc(id).stream()
                .filter(i -> i.getLineNo().equals(lineNo)).findFirst()
                .orElseThrow(() -> new NotFoundException("Line " + lineNo + " not found"));
        itemRepository.delete(item);
        itemRepository.flush();
        return toResponse(inv);
    }

    @Transactional
    public InvoiceResponse applyDiscount(Integer id, DiscountRequest r) {
        Invoice inv = draft(id);
        BigDecimal subtotal = itemRepository.findByInvoiceIdOrderByLineNoAsc(id).stream()
                .map(InvoiceItem::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (r.discount().compareTo(subtotal) > 0) {
            throw new BadRequestException("The discount cannot be more than the subtotal");
        }
        inv.setDiscount(r.discount());
        if (r.taxRate() != null) {
            inv.setTaxRate(r.taxRate());
        }
        invoiceRepository.saveAndFlush(inv);
        return toResponse(inv);
    }

    /** DRAFT -> ISSUED: the customer can now see the bill and pay the balance. */
    @Transactional
    public InvoiceResponse issue(Integer id) {
        Invoice inv = draft(id);
        if (itemRepository.findByInvoiceIdOrderByLineNoAsc(id).isEmpty()) {
            throw new ConflictException("Add at least one line before issuing the bill");
        }
        inv.setStatus(InvoiceStatus.ISSUED);
        invoiceRepository.saveAndFlush(inv);
        summaryRepository.findById(id).ifPresent(s -> {
            if (s.getBalanceDue().signum() <= 0) {
                inv.setStatus(InvoiceStatus.PAID); // the deposit already covers the bill
            }
        });
        return toResponse(inv);
    }

    @Transactional
    public InvoiceResponse cancel(Integer id) {
        Invoice inv = draft(id);
        inv.setStatus(InvoiceStatus.CANCELLED);
        return toResponse(inv);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse get(Integer id) {
        return toResponse(findVisible(id));
    }

    @Transactional(readOnly = true)
    public InvoiceResponse forJobCard(Integer jobCardId) {
        Invoice inv = invoiceRepository.findByJobCard_Id(jobCardId)
                .orElseThrow(() -> new NotFoundException("No bill has been generated for job " + jobCardId));
        return toResponse(checkVisible(inv));
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> mine() {
        return invoiceRepository.findByJobCard_Vehicle_Customer_IdAndStatusInOrderByInvoiceDateDesc(
                currentUser.id(), VISIBLE_TO_CUSTOMER).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> list(InvoiceStatus status) {
        List<Invoice> all = status == null ? invoiceRepository.findAllByOrderByInvoiceDateDescIdDesc()
                : invoiceRepository.findByStatusOrderByInvoiceDateDescIdDesc(status);
        return all.stream().map(this::toResponse).toList();
    }

    /** For Sohan: what is still owed on a job (null when there is no bill yet). */
    @Transactional(readOnly = true)
    public BigDecimal getBalance(Integer jobCardId) {
        return summaryRepository.findByJobCardId(jobCardId).map(InvoiceSummary::getBalanceDue).orElse(null);
    }

    public Invoice find(Integer id) {
        return invoiceRepository.findById(id).orElseThrow(() -> new NotFoundException("Bill not found with id: " + id));
    }

    private Invoice findVisible(Integer id) {
        return checkVisible(find(id));
    }

    private Invoice checkVisible(Invoice inv) {
        currentUser.checkOwnerOrStaff(inv.getJobCard().getVehicle().getCustomer().getId());
        if (currentUser.isCustomer() && !VISIBLE_TO_CUSTOMER.contains(inv.getStatus())) {
            throw new ForbiddenException("This bill has not been issued yet");
        }
        return inv;
    }

    private Invoice draft(Integer id) {
        Invoice inv = find(id);
        if (inv.getStatus() != InvoiceStatus.DRAFT) {
            throw new ConflictException("Only draft bills can be changed (this one is " + inv.getStatus() + ")");
        }
        return inv;
    }

    /** The booking's package; walk-ins are billed like the diagnostics package. */
    private ServiceType packageFor(JobCard jc) {
        if (jc.getAppointment() != null) {
            return jc.getAppointment().getServiceType();
        }
        return serviceTypeRepository.findFirstByPricingTypeAndActiveTrueOrderByIdAsc(PricingType.VARIABLE)
                .orElseThrow(() -> new ConflictException("No diagnostics package is set up for walk-in bills"));
    }

    private String nextInvoiceNo() {
        String prefix = "INV-" + LocalDate.now().getYear() + "-";
        String max = invoiceRepository.maxInvoiceNo(prefix + "%");
        int next = max == null ? 1 : Integer.parseInt(max.substring(prefix.length())) + 1;
        return prefix + String.format("%04d", next);
    }

    public InvoiceResponse toResponse(Invoice inv) {
        List<InvoiceLineResponse> lines = itemRepository.findByInvoiceIdOrderByLineNoAsc(inv.getId()).stream()
                .map(InvoiceLineResponse::from).toList();
        InvoiceSummary s = summaryRepository.findById(inv.getId()).orElse(null);
        BigDecimal zero = BigDecimal.ZERO.setScale(2);
        JobCard jc = inv.getJobCard();
        return new InvoiceResponse(inv.getId(), inv.getInvoiceNo(), jc.getId(), jc.getVehicle().getCustomer().getId(),
                jc.getVehicle().getCustomer().getFullName(), jc.getVehicle().getDisplayName(),
                jc.getAppointment() == null ? "Walk-in" : jc.getAppointment().getServiceType().getName(),
                inv.getInvoiceDate(), inv.getWarrantyUntil(), inv.getStatus(), inv.getIssuedBy().getFullName(), lines,
                s == null ? zero : s.getSubtotal(), inv.getDiscount(), inv.getTaxRate(),
                s == null ? zero : s.getTaxAmount(), s == null ? zero : s.getTotal(),
                s == null ? zero : s.getDepositPaid(), s == null ? zero : s.getAmountPaid(),
                s == null ? zero : s.getBalanceDue());
    }
}
