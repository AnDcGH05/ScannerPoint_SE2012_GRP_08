package ScannerPoint.example.ScannerPoint.repair.service;

import ScannerPoint.example.ScannerPoint.customer.entity.Vehicle;
import ScannerPoint.example.ScannerPoint.customer.repository.VehicleRepository;
import ScannerPoint.example.ScannerPoint.repair.dto.JobCardResponse;
import ScannerPoint.example.ScannerPoint.repair.dto.RepairRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.RepairResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.repository.JobCardRepository;
import ScannerPoint.example.ScannerPoint.user.entity.User;
import ScannerPoint.example.ScannerPoint.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;

@Service
public class RepairService {

    private final JobCardRepository jobCardRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public RepairService(JobCardRepository jobCardRepository,
                         VehicleRepository vehicleRepository,
                         UserRepository userRepository) {
        this.jobCardRepository = jobCardRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    public RepairResponse createJobCard(RepairRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        User mechanic = null;
        if (request.getMechanicId() != null) {
            mechanic = userRepository.findById(request.getMechanicId())
                    .orElseThrow(() -> new NotFoundException("Mechanic not found with id: " + request.getMechanicId()));
        }

        String generatedCardNum = "JOB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        JobCard jobCard = new JobCard(generatedCardNum, vehicle, mechanic);
        if (request.getEstimatedCost() != null) {
            jobCard.setTotalCost(request.getEstimatedCost());
        }

        JobCard saved = jobCardRepository.save(jobCard);
        return mapToResponse(saved);
    }

    public List<JobCardResponse> getAllJobCards() {
        return jobCardRepository.findAll().stream()
                .map(this::mapToJobCardResponse)
                .collect(Collectors.toList());
    }

    public RepairResponse updateJobCardStatus(Long id, String status) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Job card not found with id: " + id));

        jobCard.setStatus(status.toUpperCase());
        JobCard updated = jobCardRepository.save(jobCard);
        return mapToResponse(updated);
    }

    private RepairResponse mapToResponse(JobCard jobCard) {
        String mechanicName = (jobCard.getMechanic() != null) ? jobCard.getMechanic().getUsername() : "Unassigned";
        return new RepairResponse(
                jobCard.getId(),
                jobCard.getCardNumber(),
                jobCard.getStatus(),
                jobCard.getTotalCost(),
                jobCard.getVehicle().getLicensePlate(),
                mechanicName,
                jobCard.getCreatedAt()
        );
    }

    private JobCardResponse mapToJobCardResponse(JobCard jobCard) {
        Long mechanicId = (jobCard.getMechanic() != null) ? jobCard.getMechanic().getId() : null;
        String mechanicName = (jobCard.getMechanic() != null) ? jobCard.getMechanic().getUsername() : "Unassigned";

        return new JobCardResponse(
                jobCard.getId(),
                jobCard.getCardNumber(),
                jobCard.getStatus(),
                jobCard.getTotalCost(),
                jobCard.getVehicle().getId(),
                jobCard.getVehicle().getLicensePlate(),
                mechanicId,
                mechanicName
        );
    }
}