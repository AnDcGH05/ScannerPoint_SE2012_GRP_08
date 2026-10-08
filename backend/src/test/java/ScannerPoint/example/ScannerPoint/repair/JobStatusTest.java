package ScannerPoint.example.ScannerPoint.repair;

import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** State pattern: every allowed and forbidden stage transition (work plan, Sohan T1). */
class JobStatusTest {

    @Test
    void allowedTransitions() {
        assertTrue(JobStatus.INSPECTION.canMoveTo(JobStatus.DIAGNOSIS));
        assertTrue(JobStatus.DIAGNOSIS.canMoveTo(JobStatus.AWAITING_APPROVAL));
        assertTrue(JobStatus.DIAGNOSIS.canMoveTo(JobStatus.IN_PROGRESS));
        assertTrue(JobStatus.AWAITING_APPROVAL.canMoveTo(JobStatus.IN_PROGRESS));
        assertTrue(JobStatus.IN_PROGRESS.canMoveTo(JobStatus.QUALITY_CHECK));
        assertTrue(JobStatus.QUALITY_CHECK.canMoveTo(JobStatus.READY));
        assertTrue(JobStatus.QUALITY_CHECK.canMoveTo(JobStatus.IN_PROGRESS)); // failed quality check
        assertTrue(JobStatus.READY.canMoveTo(JobStatus.COLLECTED));
    }

    @Test
    void forbiddenTransitions() {
        assertFalse(JobStatus.INSPECTION.canMoveTo(JobStatus.READY));
        assertFalse(JobStatus.DIAGNOSIS.canMoveTo(JobStatus.QUALITY_CHECK));
        assertFalse(JobStatus.IN_PROGRESS.canMoveTo(JobStatus.READY));
        assertFalse(JobStatus.READY.canMoveTo(JobStatus.IN_PROGRESS));
        assertFalse(JobStatus.COLLECTED.canMoveTo(JobStatus.INSPECTION));
        for (JobStatus s : JobStatus.values()) {
            assertFalse(s.canMoveTo(s), s + " must not move to itself");
        }
    }

    @Test
    void stagesMatchTheEightWorkflowBoxes() {
        assertEquals(2, JobStatus.INSPECTION.getStageNo());   // box 1 is "Booked"
        assertEquals(8, JobStatus.COLLECTED.getStageNo());
        assertEquals("Repair In Progress", JobStatus.IN_PROGRESS.getLabel());
    }
}
