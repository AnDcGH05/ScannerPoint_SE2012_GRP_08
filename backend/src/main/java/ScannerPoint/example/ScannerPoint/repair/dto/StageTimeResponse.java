package ScannerPoint.example.ScannerPoint.repair.dto;

import ScannerPoint.example.ScannerPoint.repair.repository.JobCardRepository.StageTimeRow;

import java.math.BigDecimal;

public record StageTimeResponse(String stage, long timesPassed, BigDecimal avgHours) {

    public static StageTimeResponse from(StageTimeRow r) {
        return new StageTimeResponse(r.getStage(), r.getTimesPassed() == null ? 0 : r.getTimesPassed(), r.getAvgHours());
    }
}
