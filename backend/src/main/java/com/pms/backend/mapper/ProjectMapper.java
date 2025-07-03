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
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "created_by_id", ignore = true)
    @Mapping(target = "created_by_name", ignore = true)
    @Mapping(target = "color", ignore = true)
    @Mapping(target = "short_name", ignore = true)
    @Mapping(target = "created_at", ignore = true)
    @Mapping(target = "leader", ignore = true)
    Project toProject(ProjectCreationRequest request);

    ProjectResponse toProjectResponse(Project project);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "created_by_id", ignore = true)
    @Mapping(target = "created_by_name", ignore = true)
    @Mapping(target = "color", ignore = true)
    @Mapping(target = "short_name", ignore = true)
    @Mapping(target = "created_at", ignore = true)
    @Mapping(target = "leader", ignore = true)
    void updateProject(@MappingTarget Project project, ProjectUpdateRequest request);
}