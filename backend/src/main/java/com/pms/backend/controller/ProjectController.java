package com.pms.backend.controller;

import com.pms.backend.dto.request.ApiResponsive;
import com.pms.backend.dto.request.ProjectCreationRequest;
import com.pms.backend.dto.request.ProjectUpdateRequest;
import com.pms.backend.dto.response.ProjectResponse;
import com.pms.backend.service.ProjectService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/projects")
public class ProjectController {
    ProjectService projectService;

    @PostMapping("/create-project")
    public ApiResponsive<ProjectResponse> createProject(
            @RequestBody ProjectCreationRequest request,
            @RequestHeader("userId") String userId) {
        UUID uuid = UUID.fromString(userId);
        ApiResponsive<ProjectResponse> apiResponsive = new ApiResponsive<>();
        apiResponsive.setResult(projectService.createProject(request, userId));
        return apiResponsive;
    }

    @GetMapping
    public List<ProjectResponse> getProjects() {
        return projectService.getProjects();
    }

    @GetMapping("/{projectId}")
    public ProjectResponse getProject(@PathVariable("projectId") Integer projectId) {
        return projectService.getProject(projectId);
    }

    @GetMapping("/{projectId}/members")
    public List<String> getProjectMembers(@PathVariable("projectId") Integer projectId) {
        return projectService.getProjectMembers(projectId);
    }

    @PutMapping("/{projectId}")
    public ProjectResponse updateProject(
            @PathVariable("projectId") Integer projectId,
            @RequestBody ProjectUpdateRequest request,
            @RequestHeader("userId") String userId) {
        return projectService.updateProject(projectId, request, userId);
    }

    @DeleteMapping("/{projectId}")
    public String deleteProject(@PathVariable("projectId") Integer projectId) {
        projectService.deleteProject(projectId);
        return "Project has been deleted";
    }
}