package com.pms.backend.service;

import com.pms.backend.dto.request.ProjectCreationRequest;
import com.pms.backend.dto.request.ProjectUpdateRequest;
import com.pms.backend.dto.response.ProjectResponse;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.User;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.ProjectMapper;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectService {
    ProjectRepository projectRepository;
    UserRepository userRepository;
    ProjectMapper projectMapper;

    private void validateMembers(String members) {
        if (members != null && !members.isEmpty()) {
            String[] memberEmails = members.split(",");
            for (String email : memberEmails) {
                String trimmedEmail = email.trim();
                if (!trimmedEmail.isEmpty() && !userRepository.existsByEmail(trimmedEmail)) {
                    throw new AppException(ErrorStatus.USER_NOTFOUND);
                }
            }
        }
    }

    @Transactional
    public ProjectResponse createProject(ProjectCreationRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        Project project = projectMapper.toProject(request);
        project.setCreated_by_id(userId);
        project.setColor("");
        project.setShort_name("");
        project.setCreated_by_name(user.getName());
        project.setCreated_at(LocalDate.now());
        project.setMembers("");
        project.setLeader(user.getName());

        Project savedProject = projectRepository.save(project);
        projectRepository.flush();
        return projectMapper.toProjectResponse(savedProject);
    }

    @Transactional
    public ProjectResponse updateProject(Integer id, ProjectUpdateRequest request, String userId) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOTFOUND));

        validateMembers(request.getMembers());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        projectMapper.updateProject(project, request);
        if (request.getMembers() != null) {
            project.setMembers(request.getMembers()); // Update members
        }
        project.setLeader(user.getName()); // Update leader to authenticated user's name

        Project savedProject = projectRepository.save(project);
        projectRepository.flush(); // Ensure immediate persistence
        return projectMapper.toProjectResponse(savedProject);
    }

    @Transactional
    public void deleteProject(Integer id) {
        if (!projectRepository.existsById(id)) {
            throw new AppException(ErrorStatus.PROJECT_NOTFOUND);
        }
        projectRepository.deleteById(id);
        projectRepository.flush(); // Ensure immediate persistence
    }

    public List<ProjectResponse> getProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toProjectResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProject(Integer id) {
        return projectMapper.toProjectResponse(projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOTFOUND)));
    }

    public List<String> getProjectMembers(Integer id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOTFOUND));
        String members = project.getMembers();
        if (members == null || members.isEmpty()) {
            return List.of();
        }
        return Arrays.stream(members.split(","))
                .map(String::trim)
                .filter(email -> !email.isEmpty())
                .collect(Collectors.toList());
    }
}