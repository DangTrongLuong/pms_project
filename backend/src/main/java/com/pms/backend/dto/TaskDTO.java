package com.pms.backend.dto;

import com.pms.backend.enums.TaskStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskDTO {
    private Integer id;
    private String title;
    private String description;
    private String priority;
    private String assigneeId;
    private LocalDate dueDate;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private Integer sprintId;
    private Integer projectId; // Thêm trường projectId
}