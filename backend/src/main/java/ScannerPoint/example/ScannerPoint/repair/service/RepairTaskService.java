package ScannerPoint.example.ScannerPoint.repair.service;

import ScannerPoint.example.ScannerPoint.common.exception.ConflictException;
import ScannerPoint.example.ScannerPoint.common.exception.ForbiddenException;
import ScannerPoint.example.ScannerPoint.common.exception.NotFoundException;
import ScannerPoint.example.ScannerPoint.config.CurrentUser;
import ScannerPoint.example.ScannerPoint.repair.dto.TaskRequest;
import ScannerPoint.example.ScannerPoint.repair.dto.TaskResponse;
import ScannerPoint.example.ScannerPoint.repair.entity.ApprovalStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.JobCard;
import ScannerPoint.example.ScannerPoint.repair.entity.JobStatus;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTask;
import ScannerPoint.example.ScannerPoint.repair.entity.RepairTaskId;
import ScannerPoint.example.ScannerPoint.repair.entity.TaskStatus;
import ScannerPoint.example.ScannerPoint.repair.repository.RepairTaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;

/** Repair tasks on a job, and the customer's approve / reject of extra work. */
@Service
public class RepairTaskService {

    private static final EnumSet<JobStatus> CLOSED = EnumSet.of(JobStatus.READY, JobStatus.COLLECTED);

    private final RepairTaskRepository taskRepository;
    private final JobCardService jobCardService;
    private final CurrentUser currentUser;

    public RepairTaskService(RepairTaskRepository taskRepository, JobCardService jobCardService, CurrentUser currentUser) {
        this.taskRepository = taskRepository;
        this.jobCardService = jobCardService;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list(Integer jobCardId) {
        JobCard jc = jobCardService.findVisible(jobCardId);
        BigDecimal rate = jobCardService.labourRate(jc);
        return taskRepository.findByJobCardIdOrderByTaskNoAsc(jobCardId).stream()
                .map(t -> TaskResponse.from(t, rate)).toList();
    }

    /** Extra work (additional = true) starts as PENDING approval. */
    @Transactional
    public TaskResponse add(Integer jobCardId, TaskRequest r) {
        JobCard jc = openJob(jobCardId);
        int next = taskRepository.maxTaskNo(jobCardId) + 1;
        RepairTask t = new RepairTask(jobCardId, next, r.description().trim(), r.labourHours(), Boolean.TRUE.equals(r.additional()));
        taskRepository.saveAndFlush(t);
        return TaskResponse.from(t, jobCardService.labourRate(jc));
    }

    @Transactional
    public TaskResponse update(Integer jobCardId, Integer taskNo, TaskRequest r) {
        JobCard jc = openJob(jobCardId);
        RepairTask t = find(jobCardId, taskNo);
        t.setDescription(r.description().trim());
        t.setLabourHours(r.labourHours());
        if (r.taskStatus() != null && r.taskStatus() != t.getTaskStatus()) {
            boolean working = r.taskStatus() == TaskStatus.IN_PROGRESS || r.taskStatus() == TaskStatus.DONE;
            if (working && t.getApprovalStatus() == ApprovalStatus.PENDING) {
                throw new ConflictException("Wait for the customer to approve this extra work");
            }
            if (working && t.getApprovalStatus() == ApprovalStatus.REJECTED) {
                throw new ConflictException("The customer rejected this extra work");
            }
            t.setTaskStatus(r.taskStatus());
        }
        taskRepository.saveAndFlush(t);
        return TaskResponse.from(t, jobCardService.labourRate(jc));
    }

    /** Only tasks that have not been started can be deleted. */
    @Transactional
    public void delete(Integer jobCardId, Integer taskNo) {
        openJob(jobCardId);
        RepairTask t = find(jobCardId, taskNo);
        if (t.getTaskStatus() != TaskStatus.PENDING) {
            throw new ConflictException("Only tasks that have not started can be deleted");
        }
        taskRepository.delete(t);
    }

    /** The customer approves or rejects one extra task; a rejected task is cancelled. */
    @Transactional
    public TaskResponse answer(Integer jobCardId, Integer taskNo, boolean approved) {
        JobCard jc = jobCardService.find(jobCardId);
        if (!Objects.equals(jc.getVehicle().getCustomer().getId(), currentUser.id())) {
            throw new ForbiddenException("This job belongs to another customer");
        }
        RepairTask t = find(jobCardId, taskNo);
        if (t.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new ConflictException("This task is not waiting for your approval");
        }
        t.setApprovalStatus(approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED);
        if (!approved) {
            t.setTaskStatus(TaskStatus.CANCELLED);
        }
        taskRepository.saveAndFlush(t);
        return TaskResponse.from(t, jobCardService.labourRate(jc));
    }

    private JobCard openJob(Integer jobCardId) {
        JobCard jc = jobCardService.find(jobCardId);
        jobCardService.checkCanWork(jc);
        if (CLOSED.contains(jc.getStatus())) {
            throw new ConflictException("Tasks cannot be changed once the vehicle is Ready");
        }
        return jc;
    }

    private RepairTask find(Integer jobCardId, Integer taskNo) {
        return taskRepository.findById(new RepairTaskId(jobCardId, taskNo))
                .orElseThrow(() -> new NotFoundException("Task " + taskNo + " not found on job " + jobCardId));
    }
}
