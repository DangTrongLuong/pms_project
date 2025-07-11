package com.pms.backend.service;

import com.pms.backend.entity.Backlog;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.Task;
import com.pms.backend.entity.User;
import com.pms.backend.enums.SprintStatus;
import com.pms.backend.enums.TaskStatus;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.repository.BacklogRepository;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.TaskRepository;
import com.pms.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BacklogService {

    BacklogRepository backlogRepository;
    ProjectRepository projectRepository;
    UserRepository userRepository;
    TaskRepository taskRepository;

    public Backlog createSprint(Integer projectId, String sprintName, String startDate, String endDate, String sprintGoal, String userId, String userName) {
        log.info("Tạo sprint cho projectId: {} bởi userId: {}", projectId, userId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        if (backlogRepository.findByProjectIdAndBacklogName(projectId, sprintName).isPresent()) {
            throw new AppException(ErrorStatus.SPRINT_ALREADY_EXISTS);
        }

        Backlog sprint = new Backlog();
        sprint.setBacklogName(sprintName);
        sprint.setStatus(SprintStatus.PLANNED);
        try {
            sprint.setStartDate(startDate != null ? LocalDate.parse(startDate) : null);
            sprint.setEndDate(endDate != null ? LocalDate.parse(endDate) : null);
        } catch (DateTimeParseException e) {
            throw new AppException(ErrorStatus.INVALID_INPUT);
        }
        sprint.setSprintGoal(sprintGoal);
        sprint.setCreateById(userId);
        sprint.setCreateByName(userName);
        sprint.setProject(project);
        sprint.setWorkItems(0);

        Backlog savedSprint = backlogRepository.save(sprint);
        log.info("Sprint được tạo: {}", savedSprint);
        return savedSprint;
    }

    public Backlog startSprint(Integer sprintId, String userId) {
        log.info("Bắt đầu sprintId: {} bởi userId: {}", sprintId, userId);

        Backlog sprint = backlogRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));

        if (!sprint.getStatus().equals(SprintStatus.PLANNED)) {
            throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS);
        }

        sprint.setStatus(SprintStatus.ACTIVE);
        sprint.setStartDate(LocalDate.now());

        Backlog updatedSprint = backlogRepository.save(sprint);
        log.info("Sprint đã bắt đầu: {}", updatedSprint);
        return updatedSprint;
    }

    public Backlog completeSprint(Integer sprintId, String userId) {
        log.info("Hoàn thành sprintId: {} bởi userId: {}", sprintId, userId);

        Backlog sprint = backlogRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));

        if (!sprint.getStatus().equals(SprintStatus.ACTIVE)) {
            throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS);
        }

        sprint.setStatus(SprintStatus.COMPLETED);
        sprint.setEndDate(LocalDate.now());

        Backlog updatedSprint = backlogRepository.save(sprint);
        log.info("Sprint đã hoàn thành: {}", updatedSprint);
        return updatedSprint;
    }

    public void deleteSprint(Integer sprintId, String userId) {
        log.info("Xóa sprintId: {} bởi userId: {}", sprintId, userId);

        Backlog sprint = backlogRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));

        if (sprint.getStatus().equals(SprintStatus.ACTIVE)) {
            throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS);
        }

        backlogRepository.delete(sprint);
        log.info("Sprint đã xóa: {}", sprintId);
    }

    public Task createTask(Integer sprintId, String taskTitle, String description, String userId, String assigneeEmail, LocalDateTime dueDate, String priority) {
        log.info("Tạo task cho sprintId: {} bởi userId: {} với dueDate: {}", sprintId, userId, dueDate);

        Backlog sprint = backlogRepository.findById(sprintId)
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));

        if (!sprint.getStatus().equals(SprintStatus.ACTIVE)) {
            throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS);
        }

        User assignee = userRepository.findByEmail(assigneeEmail)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        Task task = new Task();
        if (taskTitle == null || taskTitle.trim().isEmpty()) {
            throw new AppException(ErrorStatus.INVALID_INPUT);
        }
        task.setTitle(taskTitle);
        task.setDescription(description);
        task.setPriority(priority);
        task.setAssignee(assignee);
        task.setDueDate(dueDate != null ? dueDate : LocalDateTime.now().plusDays(7));
        task.setStatus(TaskStatus.TODO);
        task.setBacklog(sprint);

        sprint.setWorkItems(sprint.getWorkItems() != null ? sprint.getWorkItems() + 1 : 1);
        backlogRepository.save(sprint);

        Task savedTask = taskRepository.save(task);
        log.info("Task được tạo: {}", savedTask);
        return savedTask;
    }

    public Task updateTaskStatus(Integer taskId, String status, String userId) {
        log.info("Cập nhật trạng thái taskId: {} thành {} bởi userId: {}", taskId, status, userId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorStatus.TASK_NOT_FOUND));

        try {
            TaskStatus newStatus = TaskStatus.valueOf(status);
            task.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorStatus.INVALID_TASK_STATUS);
        }

        Task updatedTask = taskRepository.save(task);
        log.info("Task đã cập nhật trạng thái: {}", updatedTask);
        return updatedTask;
    }

    public List<Backlog> getSprintsByProject(Integer projectId) {
        log.info("Lấy danh sách sprint cho projectId: {}", projectId);
        try {
            List<Backlog> sprints = backlogRepository.findByProjectId(projectId);
            return sprints.isEmpty() ? Collections.emptyList() : sprints;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách sprint cho projectId {}: {}", projectId, e.getMessage(), e);
            throw new AppException(ErrorStatus.INTERNAL_SERVER_ERROR, "Không thể lấy danh sách sprint: " + e.getMessage());
        }
    }

    public List<Task> getTasksBySprint(Integer sprintId) {
        log.info("Lấy danh sách task cho sprintId: {}", sprintId);
        try {
            Backlog sprint = backlogRepository.findById(sprintId)
                    .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));

            List<Task> tasks = taskRepository.findByBacklogId(sprintId);
            if (tasks == null) {
                log.warn("Không tìm thấy task nào cho sprintId: {}", sprintId);
                return Collections.emptyList();
            }
            log.info("Tìm thấy {} task cho sprintId: {}", tasks.size(), sprintId);
            return tasks;
        } catch (AppException e) {
            log.error("Lỗi khi lấy danh sách task: {}", e.getCustomMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy danh sách task cho sprintId {}: {}", sprintId, e.getMessage(), e);
            throw new AppException(ErrorStatus.INTERNAL_SERVER_ERROR, "Không thể lấy danh sách task: " + e.getMessage());
        }
    }
}