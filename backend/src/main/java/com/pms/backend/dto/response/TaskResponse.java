package com.pms.backend.dto.response;

import com.pms.backend.enums.TaskStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private Integer id;
    private String title;
    private String description;
    private TaskStatus status;
    private String priority;
    private String assigneeId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private Integer sprintId;
    private Integer projectId;
}