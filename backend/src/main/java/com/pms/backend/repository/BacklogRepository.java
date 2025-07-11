package com.pms.backend.repository;

import com.pms.backend.entity.Backlog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BacklogRepository extends JpaRepository<Backlog, Integer> {
    List<Backlog> findByProjectId(Integer projectId);
    Optional<Backlog> findByProjectIdAndBacklogName(Integer projectId, String backlogName);
    // Tùy chọn: Thêm phương thức lọc theo trạng thái nếu cần
    // List<Backlog> findByProjectIdAndStatus(Integer projectId, SprintStatus status);
}