package ScannerPoint.example.ScannerPoint.customer.controller;

import ScannerPoint.example.ScannerPoint.common.dto.ReasonRequest;
import ScannerPoint.example.ScannerPoint.common.storage.FileStorageService;
import ScannerPoint.example.ScannerPoint.customer.dto.DocumentResponse;
import ScannerPoint.example.ScannerPoint.customer.entity.DocType;
import ScannerPoint.example.ScannerPoint.customer.entity.VehicleDocument;
import ScannerPoint.example.ScannerPoint.customer.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
public class DocumentController {

    private final DocumentService documentService;
    private final FileStorageService fileStorageService;

    public DocumentController(DocumentService documentService, FileStorageService fileStorageService) {
        this.documentService = documentService;
        this.fileStorageService = fileStorageService;
    }

    /** multipart/form-data: file, docType, documentNo, expiryDate (yyyy-MM-dd). */
    @PostMapping(value = "/api/vehicles/{vehicleId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse upload(@PathVariable Integer vehicleId,
                                   @RequestPart("file") MultipartFile file,
                                   @RequestParam DocType docType,
                                   @RequestParam String documentNo,
                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate) {
        return documentService.upload(vehicleId, docType, documentNo, expiryDate, file);
    }

    @GetMapping("/api/vehicles/{vehicleId}/documents")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN', 'MECHANIC')")
    public List<DocumentResponse> list(@PathVariable Integer vehicleId) {
        return documentService.listForVehicle(vehicleId);
    }

    /** The uploaded PDF/image, for the preview panel. */
    @GetMapping("/api/documents/{id}/file")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Resource> file(@PathVariable Integer id) {
        VehicleDocument d = documentService.findForDownload(id);
        return ResponseEntity.ok()
                .contentType(fileStorageService.mediaType(d.getFilePath()))
                .body(documentService.file(d));
    }

    @DeleteMapping("/api/documents/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECEPTIONIST', 'ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        documentService.delete(id);
    }

    /** "Documents to verify" queue (pending + expiring within 30 days). */
    @GetMapping("/api/documents/pending")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public List<DocumentResponse> pending() {
        return documentService.verificationQueue();
    }

    @PatchMapping("/api/documents/{id}/verify")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public DocumentResponse verify(@PathVariable Integer id) {
        return documentService.verify(id);
    }

    @PatchMapping("/api/documents/{id}/reject")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public DocumentResponse reject(@PathVariable Integer id, @Valid @RequestBody ReasonRequest request) {
        return documentService.reject(id, request.reason());
    }
}
