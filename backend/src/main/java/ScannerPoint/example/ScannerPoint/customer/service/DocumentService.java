package ScannerPoint.example.ScannerPoint.customer.service;

import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.common.storage.FileStorageService;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.dto.DocumentResponse;
import ScannerPoint.example.ScannerPoint.customer.entity.DocStatus;
import ScannerPoint.example.ScannerPoint.customer.entity.DocType;
import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import ScannerPoint.example.ScannerPoint.customer.entity.VehicleDocument;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleDocumentRepository;
import ScannerPoint.example.ScannerPoint.repair.repository.EmployeeRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** Driving licence and insurance: customer uploads, receptionist verifies or rejects. */
@Service
public class DocumentService {

    private final VehicleDocumentRepository documentRepository;
    private final VehicleService vehicleService;
    private final EmployeeRepository employeeRepository;
    private final FileStorageService fileStorageService;
    private final CurrentUser currentUser;

    public DocumentService(VehicleDocumentRepository documentRepository, VehicleService vehicleService,
                           EmployeeRepository employeeRepository, FileStorageService fileStorageService,
                           CurrentUser currentUser) {
        this.documentRepository = documentRepository;
        this.vehicleService = vehicleService;
        this.employeeRepository = employeeRepository;
        this.fileStorageService = fileStorageService;
        this.currentUser = currentUser;
    }

    @Transactional
    public DocumentResponse upload(Integer vehicleId, DocType docType, String documentNo, LocalDate expiryDate,
                                   MultipartFile file) {
        Vehicle vehicle = vehicleService.findOwned(vehicleId);
        if (documentNo == null || documentNo.isBlank() || documentNo.length() > 30) {
            throw new BadRequestException("Document number is required (max 30 characters)");
        }
        if (expiryDate == null || expiryDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("This document has already expired");
        }
        String path = fileStorageService.store(file, "documents");
        VehicleDocument d = new VehicleDocument();
        d.setVehicle(vehicle);
        d.setDocType(docType);
        d.setDocumentNo(documentNo.trim());
        d.setExpiryDate(expiryDate);
        d.setFilePath(path);
        d.setStatus(DocStatus.PENDING);
        return DocumentResponse.from(documentRepository.saveAndFlush(d));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listForVehicle(Integer vehicleId) {
        vehicleService.findOwned(vehicleId);
        return documentRepository.findByVehicle_IdOrderByUploadedAtDesc(vehicleId).stream()
                .map(DocumentResponse::from).toList();
    }

    /** A document can be removed only while it is still waiting for verification. */
    @Transactional
    public void delete(Integer id) {
        VehicleDocument d = findOwned(id);
        if (d.getStatus() != DocStatus.PENDING) {
            throw new ConflictException("Only documents that are still pending can be removed");
        }
        documentRepository.delete(d);
        fileStorageService.delete(d.getFilePath());
    }

    /** Receptionist queue: pending documents, plus verified ones expiring within 30 days. */
    @Transactional(readOnly = true)
    public List<DocumentResponse> verificationQueue() {
        return documentRepository.findForVerification(LocalDate.now().plusDays(30)).stream()
                .map(DocumentResponse::from).toList();
    }

    @Transactional
    public DocumentResponse verify(Integer id) {
        VehicleDocument d = findPending(id);
        d.setStatus(DocStatus.VERIFIED);
        d.setVerifiedBy(employeeRepository.getReferenceById(currentUser.id()));
        d.setVerifiedAt(LocalDateTime.now());
        d.setRejectReason(null);
        return DocumentResponse.from(documentRepository.saveAndFlush(d));
    }

    @Transactional
    public DocumentResponse reject(Integer id, String reason) {
        VehicleDocument d = findPending(id);
        d.setStatus(DocStatus.REJECTED);
        d.setVerifiedBy(employeeRepository.getReferenceById(currentUser.id()));
        d.setVerifiedAt(LocalDateTime.now());
        d.setRejectReason(reason.trim());
        return DocumentResponse.from(documentRepository.saveAndFlush(d));
    }

    @Transactional(readOnly = true)
    public VehicleDocument findForDownload(Integer id) {
        return findOwned(id);
    }

    public Resource file(VehicleDocument d) {
        return fileStorageService.load(d.getFilePath());
    }

    /** Check-in rule (Sohan): both documents must be verified and not expired. */
    @Transactional(readOnly = true)
    public boolean bothDocumentsVerified(Integer vehicleId) {
        LocalDate today = LocalDate.now();
        return documentRepository.existsByVehicle_IdAndDocTypeAndStatusAndExpiryDateGreaterThanEqual(
                        vehicleId, DocType.DRIVING_LICENCE, DocStatus.VERIFIED, today)
                && documentRepository.existsByVehicle_IdAndDocTypeAndStatusAndExpiryDateGreaterThanEqual(
                        vehicleId, DocType.INSURANCE, DocStatus.VERIFIED, today);
    }

    private VehicleDocument findOwned(Integer id) {
        VehicleDocument d = documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Document not found with id: " + id));
        currentUser.checkOwnerOrStaff(d.getVehicle().getCustomer().getId());
        return d;
    }

    private VehicleDocument findPending(Integer id) {
        VehicleDocument d = documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Document not found with id: " + id));
        if (d.getStatus() != DocStatus.PENDING) {
            throw new ConflictException("This document has already been " + d.getStatus().name().toLowerCase());
        }
        return d;
    }
}
