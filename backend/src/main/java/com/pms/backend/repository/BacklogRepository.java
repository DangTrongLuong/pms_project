package com.pms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pms.backend.entity.Backlog;

public interface BacklogRepository extends JpaRepository<Backlog, Integer> {

    List<Backlog> findByProjectId(Integer projectId);

    Optional<Backlog> findByProjectIdAndBacklogName(Integer projectId, String backlogName);
    // Tùy chọn: Thêm phương thức lọc theo trạng thái nếu cần
    // List<Backlog> findByProjectIdAndStatus(Integer projectId, SprintStatus status);
}
