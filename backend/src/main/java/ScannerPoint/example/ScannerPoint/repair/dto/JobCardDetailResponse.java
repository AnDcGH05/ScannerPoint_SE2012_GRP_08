package ScannerPoint.example.ScannerPoint.repair.dto;

import java.util.List;

/** Mechanic job page / customer job page: header, inspection, tasks and stage history. */
public record JobCardDetailResponse(
        JobCardResponse job,
        String problemDescription,
        InspectionResponse inspection,
        List<TaskResponse> tasks,
        List<HistoryResponse> history) {
}
