package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.repository.JobCardRepository.MechanicWorkloadRow;

public record MechanicWorkloadResponse(
        Integer mechanicId,
        String mechanic,
        String specialization,
        long openJobs,
        long completedJobs) {

    public static MechanicWorkloadResponse from(MechanicWorkloadRow r) {
        return new MechanicWorkloadResponse(r.getMechanicId(), r.getMechanic(), r.getSpecialization(),
                r.getOpenJobs() == null ? 0 : r.getOpenJobs(), r.getCompletedJobs() == null ? 0 : r.getCompletedJobs());
    }
}
