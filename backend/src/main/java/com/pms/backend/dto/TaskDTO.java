package com.pms.backend.dto;

import com.pms.backend.enums.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class TaskDTO {
    private Integer id;
    private String title;
    private String description;
    private String priority;
    private String assigneeId;
    private String assigneeEmail;
    private String assigneeName;
    private String assigneeAvatarUrl;
    private LocalDate dueDate;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private Integer sprintId;
    private Integer projectId;
}