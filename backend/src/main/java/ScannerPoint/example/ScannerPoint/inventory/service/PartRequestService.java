package ScannerPoint.example.ScannerPoint.inventory.service;

import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.inventory.dto.PartRequestCreate;
import ScannerPoint.example.ScannerPoint.inventory.dto.PartRequestResponse;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartRequest;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartRequestStatus;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartUsage;
import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import ScannerPoint.example.ScannerPoint.inventory.repository.PartRequestRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.PartUsageRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.Employee;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import ScannerPoint.example.ScannerPoint.repair.service.JobCardService;
import ScannerPoint.example.ScannerPoint.user.entity.Role;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;

/** Mechanic requests a part for a job; the storekeeper issues it or rejects it with a reason. */
@Service
public class PartRequestService {

    private static final EnumSet<PartRequestStatus> OPEN = EnumSet.of(PartRequestStatus.PENDING, PartRequestStatus.BACK_ORDERED);

    private final PartRequestRepository requestRepository;
    private final PartUsageRepository usageRepository;
    private final SparePartService partService;
    private final StockService stockService;
    private final JobCardService jobCardService;
    private final CurrentUser currentUser;
    private final EntityManager entityManager;

    public PartRequestService(PartRequestRepository requestRepository, PartUsageRepository usageRepository,
                              SparePartService partService, StockService stockService, JobCardService jobCardService,
                              CurrentUser currentUser, EntityManager entityManager) {
        this.requestRepository = requestRepository;
        this.usageRepository = usageRepository;
        this.partService = partService;
        this.stockService = stockService;
        this.jobCardService = jobCardService;
        this.currentUser = currentUser;
        this.entityManager = entityManager;
    }

    @Transactional
    public PartRequestResponse create(PartRequestCreate r) {
        JobCard jc = jobCardService.find(r.jobCardId());
        jobCardService.checkCanWork(jc); // a mechanic can only request parts for their own job
        if (jc.getStatus() == JobStatus.READY || jc.getStatus() == JobStatus.COLLECTED) {
            throw new ConflictException("Parts cannot be requested once the vehicle is Ready");
        }
        SparePart part = partService.find(r.partId());
        if (!Boolean.TRUE.equals(part.getActive())) {
            throw new ConflictException(part.getPartName() + " is no longer stocked");
        }
        PartRequest pr = new PartRequest();
        pr.setJobCard(jc);
        pr.setPart(part);
        pr.setQuantity(r.quantity());
        return PartRequestResponse.from(requestRepository.saveAndFlush(pr));
    }

    /** The mechanic withdraws a request that has not been handled yet. */
    @Transactional
    public void withdraw(Integer id) {
        PartRequest pr = find(id);
        jobCardService.checkCanWork(pr.getJobCard());
        if (pr.getStatus() != PartRequestStatus.PENDING) {
            throw new ConflictException("Only pending requests can be withdrawn");
        }
        requestRepository.delete(pr);
    }

    /**
     * Queue. Storekeeper: ?status= (default: pending and back-ordered). Mechanic: only their
     * own jobs' requests. ?jobCardId= shows one job's requests (mechanic job page).
     */
    @Transactional(readOnly = true)
    public List<PartRequestResponse> list(PartRequestStatus status, Integer jobCardId) {
        List<PartRequest> list;
        if (jobCardId != null) {
            JobCard jc = jobCardService.find(jobCardId);
            jobCardService.checkCanWork(jc);
            list = requestRepository.findByJobCard_IdOrderByRequestedAtAsc(jobCardId);
        } else if (currentUser.role() == Role.MECHANIC) {
            list = requestRepository.findByJobCard_Mechanic_IdOrderByRequestedAtDesc(currentUser.id());
        } else if (status == null) {
            list = requestRepository.findByStatusInOrderByRequestedAtAsc(OPEN);
        } else {
            list = requestRepository.findByStatusInOrderByRequestedAtAsc(EnumSet.of(status));
        }
        return list.stream().filter(r -> status == null || r.getStatus() == status)
                .map(PartRequestResponse::from).toList();
    }

    /**
     * "Approve & issue" in ONE transaction: save the PART_USAGE row at today's price (the
     * triggers check the stock, write the ISSUE ledger row and lower the stock), then mark
     * the request ISSUED. If anything fails, nothing is saved.
     */
    @Transactional
    public PartRequestResponse issue(Integer id, Employee storekeeper) {
        PartRequest pr = findOpen(id);
        SparePart part = pr.getPart();
        usageRepository.saveAndFlush(new PartUsage(pr.getJobCard(), part, pr.getQuantity(), storekeeper));
        pr.handle(PartRequestStatus.ISSUED, storekeeper);
        pr.setRejectReason(null);
        requestRepository.saveAndFlush(pr);
        entityManager.refresh(part); // stock was changed by the trigger
        stockService.publishIfLowStock(part);
        return PartRequestResponse.from(pr);
    }

    @Transactional
    public PartRequestResponse reject(Integer id, String reason, Employee storekeeper) {
        PartRequest pr = findOpen(id);
        pr.handle(PartRequestStatus.REJECTED, storekeeper);
        pr.setRejectReason(reason.trim());
        return PartRequestResponse.from(requestRepository.saveAndFlush(pr));
    }

    /** Not enough stock: keep the request open until the delivery arrives. */
    @Transactional
    public PartRequestResponse backOrder(Integer id, Employee storekeeper) {
        PartRequest pr = find(id);
        if (pr.getStatus() != PartRequestStatus.PENDING) {
            throw new ConflictException("Only pending requests can be back-ordered");
        }
        pr.handle(PartRequestStatus.BACK_ORDERED, storekeeper);
        return PartRequestResponse.from(requestRepository.saveAndFlush(pr));
    }

    private PartRequest find(Integer id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Part request not found with id: " + id));
    }

    private PartRequest findOpen(Integer id) {
        PartRequest pr = find(id);
        if (!OPEN.contains(pr.getStatus())) {
            throw new ConflictException("This request has already been " + pr.getStatus().name().toLowerCase());
        }
        return pr;
    }

}
