package ScannerPoint.example.ScannerPoint.repair.entity;

import java.util.EnumSet;
import java.util.Set;

/**
 * State pattern: each stage of the smart repair workflow knows which stages may come
 * next. JobCardService asks the current state before every move, so an illegal jump
 * (e.g. INSPECTION straight to READY) is impossible.
 *
 * Extra conditions (pending approvals, unfinished tasks, unpaid bill) are checked by
 * JobCardService.checkEntryRules().
 */
public enum JobStatus {

    INSPECTION(2, "Inspection") {
        @Override public Set<JobStatus> next() { return EnumSet.of(DIAGNOSIS); }
    },
    DIAGNOSIS(3, "Diagnosis") {
        @Override public Set<JobStatus> next() { return EnumSet.of(AWAITING_APPROVAL, IN_PROGRESS); }
    },
    AWAITING_APPROVAL(4, "Awaiting Approval") {
        @Override public Set<JobStatus> next() { return EnumSet.of(IN_PROGRESS); }
    },
    IN_PROGRESS(5, "Repair In Progress") {
        @Override public Set<JobStatus> next() { return EnumSet.of(QUALITY_CHECK); }
    },
    QUALITY_CHECK(6, "Quality Check") {
        // READY, or back to repair when the quality check fails
        @Override public Set<JobStatus> next() { return EnumSet.of(READY, IN_PROGRESS); }
    },
    READY(7, "Ready") {
        @Override public Set<JobStatus> next() { return EnumSet.of(COLLECTED); }
    },
    COLLECTED(8, "Collected") {
        @Override public Set<JobStatus> next() { return EnumSet.noneOf(JobStatus.class); }
    };

    /** Position in the eight customer workflow boxes (box 1 is "Booked"). */
    private final int stageNo;
    private final String label;

    JobStatus(int stageNo, String label) {
        this.stageNo = stageNo;
        this.label = label;
    }

    public abstract Set<JobStatus> next();

    public boolean canMoveTo(JobStatus target) {
        return next().contains(target);
    }

    public int getStageNo() { return stageNo; }
    public String getLabel() { return label; }
}
