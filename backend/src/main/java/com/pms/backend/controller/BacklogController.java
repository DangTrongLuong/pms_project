package com.pms.backend.controller;

import com.pms.backend.entity.Backlog;
import com.pms.backend.entity.Task;
import com.pms.backend.exception.AppException;
import com.pms.backend.service.BacklogService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/backlog")
public class BacklogController {

    BacklogService backlogService;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @PostMapping("/sprint/{projectId}")
    public ResponseEntity<?> createSprint(
            @PathVariable Integer projectId,
            @RequestParam String sprintName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String sprintGoal,
            @RequestHeader("userId") String userId,
            @RequestHeader("userName") String userName) {
        try {
            log.info("Tạo sprint cho projectId: {}, userId: {}, userName: {}", projectId, userId, userName);
            Backlog sprint = backlogService.createSprint(projectId, sprintName, startDate, endDate, sprintGoal, userId, userName);
            return ResponseEntity.ok(sprint);
        } catch (AppException e) {
            log.error("Lỗi khi tạo sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi tạo sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/sprint/{sprintId}/start")
    public ResponseEntity<?> startSprint(
            @PathVariable Integer sprintId,
            @RequestHeader("userId") String userId) {
        try {
            log.info("Bắt đầu sprintId: {}, userId: {}", sprintId, userId);
            Backlog sprint = backlogService.startSprint(sprintId, userId);
            return ResponseEntity.ok(sprint);
        } catch (AppException e) {
            log.error("Lỗi khi bắt đầu sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi bắt đầu sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/sprint/{sprintId}/complete")
    public ResponseEntity<?> completeSprint(
            @PathVariable Integer sprintId,
            @RequestHeader("userId") String userId) {
        try {
            log.info("Hoàn thành sprintId: {}, userId: {}", sprintId, userId);
            Backlog sprint = backlogService.completeSprint(sprintId, userId);
            return ResponseEntity.ok(sprint);
        } catch (AppException e) {
            log.error("Lỗi khi hoàn thành sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi hoàn thành sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @DeleteMapping("/sprint/{sprintId}")
    public ResponseEntity<?> deleteSprint(
            @PathVariable Integer sprintId,
            @RequestHeader("userId") String userId) {
        try {
            log.info("Xóa sprintId: {}, userId: {}", sprintId, userId);
            backlogService.deleteSprint(sprintId, userId);
            return ResponseEntity.noContent().build();
        } catch (AppException e) {
            log.error("Lỗi khi xóa sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi xóa sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PostMapping("/task/{sprintId}")
    public ResponseEntity<?> createTask(
            @PathVariable Integer sprintId,
            @RequestParam String taskTitle,
            @RequestParam(required = false) String description,
            @RequestParam String assigneeEmail,
            @RequestParam(required = false) String dueDate,
            @RequestParam String priority,
            @RequestHeader("userId") String userId) {
        log.info("Nhận dueDate: {}", dueDate);
        LocalDateTime dueDateTime = null;
        if (dueDate != null && !dueDate.trim().isEmpty()) {
            try {
                dueDateTime = LocalDateTime.parse(dueDate, DATE_TIME_FORMATTER);
            } catch (DateTimeParseException e) {
                log.error("Lỗi định dạng dueDate: {}", e.getMessage());
                return ResponseEntity.status(400).body(
                    Map.of("status", 400, "message", "Định dạng ngày hết hạn không hợp lệ!")
                );
            }
        }
        try {
            Task task = backlogService.createTask(sprintId, taskTitle, description, userId, assigneeEmail, dueDateTime, priority);
            return ResponseEntity.ok(task);
        } catch (AppException e) {
            log.error("Lỗi khi tạo task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi tạo task: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/task/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable Integer taskId,
            @RequestParam String status,
            @RequestHeader("userId") String userId) {
        try {
            log.info("Cập nhật trạng thái taskId: {}, status: {}, userId: {}", taskId, status, userId);
            Task task = backlogService.updateTaskStatus(taskId, status, userId);
            return ResponseEntity.ok(task);
        } catch (AppException e) {
            log.error("Lỗi khi cập nhật trạng thái task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi cập nhật trạng thái task: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @GetMapping("/sprints/{projectId}")
    public ResponseEntity<?> getSprintsByProject(
            @PathVariable Integer projectId) {
        try {
            log.info("Lấy danh sách sprint cho projectId: {}", projectId);
            List<Backlog> sprints = backlogService.getSprintsByProject(projectId);
            return ResponseEntity.ok(sprints);
        } catch (AppException e) {
            log.error("Lỗi khi lấy danh sách sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy danh sách sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @GetMapping("/tasks/{sprintId}")
    public ResponseEntity<?> getTasksBySprint(
            @PathVariable Integer sprintId) {
        try {
            log.info("Lấy danh sách task cho sprintId: {}", sprintId);
            List<Task> tasks = backlogService.getTasksBySprint(sprintId);
            return ResponseEntity.ok(tasks);
        } catch (AppException e) {
            log.error("Lỗi khi lấy danh sách task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy danh sách task cho sprintId {}: {}", sprintId, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }
}