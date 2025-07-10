package com.pms.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pms.backend.dto.request.BacklogCreationRequest;
import com.pms.backend.dto.request.BacklogUpdateRequest;
import com.pms.backend.dto.response.BacklogResponse;
import com.pms.backend.entity.Backlog;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.BacklogMapper;
import com.pms.backend.repository.BacklogRepository;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BacklogService {

    BacklogRepository backlogRepository;
    BacklogMapper backlogMapper;

    @Autowired
    public BacklogService(BacklogRepository backlogRepository, BacklogMapper backlogMapper) {
        this.backlogRepository = backlogRepository;
        this.backlogMapper = backlogMapper;
    }

    public BacklogResponse createBacklog(BacklogCreationRequest request, String userId) {
        Backlog backlog = backlogMapper.toBacklog(request);
        backlog.setCreate_by_id(userId);
        backlog.setCreate_by_name(getCurrentUserName(userId)); // Assume method to get user name
        if ("custom".equals(request.getDuration())) {
            if (request.getStart_date() == null || request.getEnd_date() == null) {
                throw new AppException(ErrorStatus.INVALID_INPUT);
            }
        } else {
            LocalDate startDate = LocalDate.now();
            backlog.setStart_date(startDate);
            int weeks = Integer.parseInt(request.getDuration().replace(" tuần", ""));
            LocalDate endDate = startDate.plusWeeks(weeks);
            backlog.setEnd_date(endDate);
        }
        return backlogMapper.toBacklogResponse(backlogRepository.save(backlog));
    }

    public BacklogResponse getBacklog(int id) {
        Backlog backlog = backlogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorStatus.NOT_FOUND));
        return backlogMapper.toBacklogResponse(backlog);
    }

    public Iterable<BacklogResponse> getAllBacklogs() {
        return backlogRepository.findAll().stream()
                .map(backlogMapper::toBacklogResponse)
                .collect(Collectors.toList());
    }

    public BacklogResponse updateBacklog(int id, BacklogUpdateRequest request, String userId) {
        Backlog backlog = backlogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorStatus.NOT_FOUND));
        if (!backlog.getCreate_by_id().equals(userId)) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }
        backlogMapper.updateBacklogFromRequest(backlog, request);
        return backlogMapper.toBacklogResponse(backlogRepository.save(backlog));
    }

    public void deleteBacklog(int id, String userId) {
        Backlog backlog = backlogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorStatus.NOT_FOUND));
        if (!backlog.getCreate_by_id().equals(userId)) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }
        backlogRepository.delete(backlog);
    }

    private String getCurrentUserName(String userId) {
        // Assume this method retrieves the user name from UserRepository
        return "UserName"; // Placeholder, implement with actual logic
    }
}