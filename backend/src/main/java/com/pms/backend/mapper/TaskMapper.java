package com.pms.backend.mapper;

import com.pms.backend.dto.request.TaskCreationRequest;
import com.pms.backend.dto.request.TaskUpdateRequest;
import com.pms.backend.dto.response.TaskResponse;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.Task;
import com.pms.backend.entity.User;
import com.pms.backend.enums.TaskStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    TaskMapper INSTANCE = Mappers.getMapper(TaskMapper.class);

    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "dueDate", source = "dueDate", qualifiedByName = "parseLocalDateToDateTime")
    @Mapping(target = "priority", source = "priority")
    @Mapping(target = "assignee", ignore = true) // assignee được xử lý trong service qua assigneeEmail
    @Mapping(target = "sprint", ignore = true) // sprintId được xử lý trong service
    @Mapping(target = "project", ignore = true) // projectId được xử lý trong service
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "status", constant = "TODO")
    Task toTask(TaskCreationRequest request);

    @Mapping(target = "status", source = "status")
    void updateTaskFromRequest(TaskUpdateRequest request, @MappingTarget Task task);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "dueDate", source = "dueDate", qualifiedByName = "formatDateTimeToLocalDate")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "priority", source = "priority")
    @Mapping(target = "assigneeId", source = "assignee.id")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "sprintId", source = "sprint.id")
    @Mapping(target = "projectId", source = "project.id")
    TaskResponse toTaskResponse(Task task);

    @Named("parseLocalDateToDateTime")
    default LocalDateTime parseLocalDateToDateTime(LocalDate date) {
        if (date == null) return null;
        try {
            return date.atStartOfDay();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date conversion: " + date, e);
        }
    }

    @Named("formatDateTimeToLocalDate")
    default LocalDate formatDateTimeToLocalDate(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.toLocalDate();
    }
}