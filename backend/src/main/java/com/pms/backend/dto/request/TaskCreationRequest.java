package com.pms.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskCreationRequest {
    private String title;
    private String description;
    private String priority;
    private String assigneeEmail;
    private LocalDate dueDate;
    private Integer projectId; // Thêm trường projectId
}