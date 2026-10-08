package ScannerPoint.example.ScannerPoint.customer.service;

import ScannerPoint.example.ScannerPoint.common.exception.BadRequestException;
import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.common.storage.FileStorageService;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.customer.dto.DocumentResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.ServiceDueResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.ServiceHistoryResponse;
import ScannerPoint.example.ScannerPoint.customer.dto.VehicleRequest;
import ScannerPoint.example.ScannerPoint.customer.dto.VehicleResponse;
import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import ScannerPoint.example.ScannerPoint.customer.entity.VehicleDocument;
import ScannerPoint.example.ScannerPoint.customer.repository.CustomerRepository;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleDocumentRepository;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleDocumentRepository documentRepository;
    private final CustomerRepository customerRepository;
    private final FileStorageService fileStorageService;
    private final CurrentUser currentUser;

    public VehicleService(VehicleRepository vehicleRepository, VehicleDocumentRepository documentRepository,
                          CustomerRepository customerRepository, FileStorageService fileStorageService,
                          CurrentUser currentUser) {
        this.vehicleRepository = vehicleRepository;
        this.documentRepository = documentRepository;
        this.customerRepository = customerRepository;
        this.fileStorageService = fileStorageService;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> listForCustomer(Integer customerId) {
        return vehicleRepository.findByCustomer_IdOrderByIdAsc(customerId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> searchByPlate(String plate) {
        return vehicleRepository.findByRegistrationNoContainingIgnoreCaseOrderByRegistrationNoAsc(plate.trim())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public VehicleResponse get(Integer id) {
        return toResponse(findOwned(id));
    }

    /** Customers add to their own garage; staff must say which customer the vehicle belongs to. */
    @Transactional
    public VehicleResponse create(VehicleRequest r) {
        Integer ownerId = currentUser.isCustomer() ? currentUser.id() : r.customerId();
        if (ownerId == null) {
            throw new BadRequestException("customerId is required");
        }
        Customer owner = customerRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Customer not found with id: " + ownerId));
        return createFor(owner, r);
    }

    @Transactional
    public VehicleResponse createFor(Customer owner, VehicleRequest r) {
        String plate = r.registrationNo().trim().toUpperCase(Locale.ROOT);
        if (vehicleRepository.existsByRegistrationNoIgnoreCase(plate)) {
            throw new ConflictException("A vehicle with number plate " + plate + " is already registered");
        }
        Vehicle v = new Vehicle();
        v.setCustomer(owner);
        v.setRegistrationNo(plate);
        apply(v, r);
        vehicleRepository.saveAndFlush(v);
        return toResponse(vehicleRepository.findById(v.getId()).orElseThrow()); // re-read: province_code is generated
    }

    @Transactional
    public VehicleResponse update(Integer id, VehicleRequest r) {
        Vehicle v = findOwned(id);
        String plate = r.registrationNo().trim().toUpperCase(Locale.ROOT);
        if (!v.getRegistrationNo().equalsIgnoreCase(plate)) {
            if (vehicleRepository.existsByRegistrationNoIgnoreCase(plate)) {
                throw new ConflictException("A vehicle with number plate " + plate + " is already registered");
            }
            v.setRegistrationNo(plate);
        }
        apply(v, r);
        vehicleRepository.saveAndFlush(v);
        return toResponse(v);
    }

    /** Only vehicles without bookings or job cards can be removed (their history must be kept). */
    @Transactional
    public void delete(Integer id) {
        Vehicle v = findOwned(id);
        if (vehicleRepository.hasServiceHistory(id) > 0) {
            throw new ConflictException("Vehicles with service history cannot be removed");
        }
        List<VehicleDocument> docs = documentRepository.findByVehicle_IdOrderByUploadedAtDesc(id);
        documentRepository.deleteAll(docs);
        vehicleRepository.delete(v);
        docs.forEach(d -> fileStorageService.delete(d.getFilePath()));
    }

    @Transactional(readOnly = true)
    public List<ServiceHistoryResponse> history(Integer id) {
        findOwned(id);
        return vehicleRepository.serviceHistory(id).stream().map(ServiceHistoryResponse::from).toList();
    }

    /** Predictive maintenance list; customers only see their own vehicles. */
    @Transactional(readOnly = true)
    public List<ServiceDueResponse> serviceDue() {
        Integer customerId = currentUser.isCustomer() ? currentUser.id() : null;
        return vehicleRepository.dueForService(customerId).stream().map(ServiceDueResponse::from).toList();
    }

    /** Loads the vehicle and checks a customer is not looking at somebody else's. */
    public Vehicle findOwned(Integer id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));
        currentUser.checkOwnerOrStaff(v.getCustomer().getId());
        return v;
    }

    private static void apply(Vehicle v, VehicleRequest r) {
        if (r.lastServiceMileage() != null && r.lastServiceMileage() > r.currentMileage()) {
            throw new BadRequestException("Last service mileage cannot be more than the current mileage");
        }
        v.setMake(r.make().trim());
        v.setModel(r.model().trim());
        v.setManufactureYear(r.manufactureYear());
        v.setFuelType(r.fuelType());
        v.setCurrentMileage(r.currentMileage());
        v.setLastServiceDate(r.lastServiceDate());
        v.setLastServiceMileage(r.lastServiceMileage());
    }

    private VehicleResponse toResponse(Vehicle v) {
        List<DocumentResponse> docs = documentRepository.findByVehicle_IdOrderByUploadedAtDesc(v.getId())
                .stream().map(DocumentResponse::from).toList();
        return VehicleResponse.from(v, vehicleRepository.hasServiceHistory(v.getId()) > 0, docs);
    }
}
