package com.pms.backend.service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pms.backend.dto.request.ProjectCreationRequest;
import com.pms.backend.dto.request.ProjectUpdateRequest;
import com.pms.backend.dto.response.ProjectResponse;
import com.pms.backend.entity.Project;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.ProjectMapper;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectService {
    ProjectRepository projectRepository;
    UserRepository userRepository;
    ProjectMapper projectMapper;

    // Tạo màu ngẫu nhiên
    private String generateRandomColor() {
        Random random = new Random();
        int r = random.nextInt(256);
        int g = random.nextInt(256);
        int b = random.nextInt(256);
        return String.format("#%02x%02x%02x", r, g, b);
    }

    // Tạo short_name từ project_name
    private String generateShortName(String projectName) {
        if (projectName == null || projectName.trim().isEmpty()) {
            return "";
        }
        return projectName.trim().substring(0, 1).toUpperCase();
    }

    public ProjectResponse createProject(ProjectCreationRequest request, String userId, String userName) {
        log.info("Creating project for userId: {}, userName: {}", userId, userName);

        // Validate request
        if (request.getProject_name() == null || request.getProject_name().trim().isEmpty()) {
            throw new AppException(ErrorStatus.INVALID_INPUT);
        }
        if (request.getProject_type() == null || request.getProject_type().trim().isEmpty()) {
            throw new AppException(ErrorStatus.INVALID_INPUT);
        }

        Project project = projectMapper.toProject(request);
        project.setCreated_by_id(userId);
        project.setCreated_by_name(userName);
        project.setLeader(userName);
        project.setColor(generateRandomColor());
        project.setShort_name(generateShortName(request.getProject_name()));
        project.setStart_date(request.getStart_date());
        project.setEnd_date(request.getEnd_date());

        Project savedProject = projectRepository.save(project);
        log.info("Project created: {}", savedProject);

        return projectMapper.toProjectResponse(savedProject);
    }

    public List<ProjectResponse> getProjectsByUser(String userId) {
    log.info("Fetching projects for userId: {}", userId);
    List<Project> projects = projectRepository.findAll()
            .stream()
            .filter(project -> project.getCreated_by_id().equals(userId))
            .collect(Collectors.toList());
    return projects.stream()
            .map(projectMapper::toProjectResponse)
            .collect(Collectors.toList());
}

    public ProjectResponse getProjectById(int projectId, String userId) {
        log.info("Fetching projectId: {} for userId: {}", projectId, userId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));
        if (!project.getCreated_by_id().equals(userId)) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }
        return projectMapper.toProjectResponse(project);
    }

    public ProjectResponse updateProject(int projectId, ProjectUpdateRequest request, String userId) {
    log.info("Updating projectId: {} for userId: {}", projectId, userId);
    Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));
    if (!project.getCreated_by_id().equals(userId)) {
        throw new AppException(ErrorStatus.UNAUTHORIZED);
    }

    projectMapper.updateProjectFromRequest(project, request);
    if (request.getProject_name() != null && !request.getProject_name().trim().isEmpty()) {
        project.setShort_name(generateShortName(request.getProject_name()));
    }
    project.setStart_date(request.getStart_date());
    project.setEnd_date(request.getEnd_date());

    Project updatedProject = projectRepository.save(project);
    log.info("Project updated: {}", updatedProject);
    return projectMapper.toProjectResponse(updatedProject);
}

    public void deleteProject(int projectId, String userId) {
        log.info("Deleting projectId: {} for userId: {}", projectId, userId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));
        if (!project.getCreated_by_id().equals(userId)) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }
        projectRepository.delete(project);
        log.info("Project deleted: {}", projectId);
    }
}