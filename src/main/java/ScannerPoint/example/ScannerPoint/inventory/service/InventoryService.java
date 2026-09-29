// inventory/service/InventoryService.java
package ScannerPoint.example.ScannerPoint.inventory.service;

import ScannerPoint.example.ScannerPoint.inventory.dto.InventoryResponse;
import ScannerPoint.example.ScannerPoint.inventory.entity.InventoryTransaction;
import ScannerPoint.example.ScannerPoint.inventory.entity.PartUsage;
import ScannerPoint.example.ScannerPoint.inventory.entity.SparePart;
import ScannerPoint.example.ScannerPoint.inventory.repository.InventoryTransactionRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.PartUsageRepository;
import ScannerPoint.example.ScannerPoint.inventory.repository.SparePartRepository;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.repository.JobCardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final SparePartRepository sparePartRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final PartUsageRepository partUsageRepository;
    private final JobCardRepository jobCardRepository;

    public InventoryService(SparePartRepository sparePartRepository,
                            InventoryTransactionRepository transactionRepository,
                            PartUsageRepository partUsageRepository,
                            JobCardRepository jobCardRepository) {
        this.sparePartRepository = sparePartRepository;
        this.transactionRepository = transactionRepository;
        this.partUsageRepository = partUsageRepository;
        this.jobCardRepository = jobCardRepository;
    }

    public InventoryResponse restockPart(Long partId, Integer quantity, String notes) {
        SparePart part = sparePartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Spare part not found with id: " + partId));

        part.setQuantityInStock(part.getQuantityInStock() + quantity);
        sparePartRepository.save(part);

        InventoryTransaction transaction = new InventoryTransaction(part, "RESTOCK", quantity, notes);
        InventoryTransaction saved = transactionRepository.save(transaction);

        return mapToResponse(saved);
    }

    public void dispensePartForJob(Long jobCardId, Long partId, Integer quantity) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found with id: " + jobCardId));

        SparePart part = sparePartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Spare part not found with id: " + partId));

        if (part.getQuantityInStock() < quantity) {
            throw new RuntimeException("Insufficient stock available for part: " + part.getName());
        }

        part.setQuantityInStock(part.getQuantityInStock() - quantity);
        sparePartRepository.save(part);

        PartUsage usage = new PartUsage(jobCard, part, quantity, part.getPrice());
        partUsageRepository.save(usage);

        InventoryTransaction transaction = new InventoryTransaction(
                part, "DISPENSE", quantity, "Dispensed for JobCard #" + jobCard.getCardNumber()
        );
        transactionRepository.save(transaction);
    }

    public List<InventoryResponse> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InventoryResponse mapToResponse(InventoryTransaction t) {
        return new InventoryResponse(
                t.getId(),
                t.getSparePart().getName(),
                t.getTransactionType(),
                t.getQuantity(),
                t.getTransactionDate(),
                t.getNotes()
        );
    }
}