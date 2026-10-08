package ScannerPoint.example.ScannerPoint.repair.entity;

import java.io.Serializable;
import java.util.Objects;

/** Composite key of REPAIR_TASK: (job_card_id, task_no). */
public class RepairTaskId implements Serializable {

    private Integer jobCardId;
    private Integer taskNo;

    public RepairTaskId() {
    }

    public RepairTaskId(Integer jobCardId, Integer taskNo) {
        this.jobCardId = jobCardId;
        this.taskNo = taskNo;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof RepairTaskId other
                && Objects.equals(jobCardId, other.jobCardId) && Objects.equals(taskNo, other.taskNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jobCardId, taskNo);
    }
}
