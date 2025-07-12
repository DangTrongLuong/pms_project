package com.pms.backend.dto.request;

import com.pms.backend.enums.TaskStatus;
import lombok.Data;

@Data
public class TaskUpdateRequest {
    private TaskStatus status;
}