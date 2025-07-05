package com.pms.backend.mapper;

import com.pms.backend.dto.request.ProjectCreationRequest;
import com.pms.backend.dto.request.ProjectUpdateRequest;
import com.pms.backend.dto.response.ProjectResponse;
import com.pms.backend.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProjectMapper {
    @Mapping(target = "created_at", expression = "java(java.time.LocalDate.now())")
    @Mapping(target = "color", ignore = true) // Tạm thời bỏ qua, sẽ được xử lý trong service
    @Mapping(target = "short_name", ignore = true) // Tạm thời bỏ qua, sẽ được xử lý trong service
    @Mapping(target = "created_by_id", ignore = true) // Được xử lý trong service
    @Mapping(target = "created_by_name", ignore = true) // Được xử lý trong service
    @Mapping(target = "leader", ignore = true) // Được xử lý trong service
    Project toProject(ProjectCreationRequest request);

    ProjectResponse toProjectResponse(Project project);

    @Mapping(target = "project_name", source = "project_name")
    @Mapping(target = "project_type", source = "project_type")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "leader", source = "leader")
    @Mapping(target = "members", source = "members")
    void updateProjectFromRequest(@MappingTarget Project project, ProjectUpdateRequest request);
}