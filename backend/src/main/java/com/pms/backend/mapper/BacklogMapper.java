package com.pms.backend.mapper;

import org.springframework.stereotype.Component;

import com.pms.backend.dto.request.BacklogCreationRequest;
import com.pms.backend.dto.request.BacklogUpdateRequest;
import com.pms.backend.dto.response.BacklogResponse;
import com.pms.backend.entity.Backlog;

@Component
public class BacklogMapper {

    public Backlog toBacklog(BacklogCreationRequest request) {
        Backlog backlog = new Backlog();
        backlog.setBacklog_name(request.getBacklog_name());
        backlog.setStart_date(request.getStart_date());
        backlog.setEnd_date(request.getEnd_date());
        backlog.setSprint_goal(request.getSprint_goal());
        backlog.setWork_items(0); // Default value
        backlog.setStatus("NOT_STARTED"); // Default status
        backlog.setProject_id(request.getProject_id()); // Ánh xạ project_id
        return backlog;
    }

    public void updateBacklogFromRequest(Backlog backlog, BacklogUpdateRequest request) {
        backlog.setBacklog_name(request.getBacklog_name());
        backlog.setStart_date(request.getStart_date());
        backlog.setEnd_date(request.getEnd_date());
        backlog.setSprint_goal(request.getSprint_goal());
        if (request.getStatus() != null) {
            backlog.setStatus(request.getStatus());
        }
    }

    public BacklogResponse toBacklogResponse(Backlog backlog) {
        BacklogResponse response = new BacklogResponse();
        response.setId(backlog.getId());
        response.setBacklog_name(backlog.getBacklog_name());
        response.setStart_date(backlog.getStart_date());
        response.setEnd_date(backlog.getEnd_date());
        response.setWork_items(backlog.getWork_items());
        response.setStatus(backlog.getStatus());
        response.setSprint_goal(backlog.getSprint_goal());
        response.setCreate_by_id(backlog.getCreate_by_id());
        response.setCreate_by_name(backlog.getCreate_by_name());
        response.setProject_id(backlog.getProject_id()); // Thêm project_id vào response
        return response;
    }
}