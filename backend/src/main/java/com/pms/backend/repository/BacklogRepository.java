package com.pms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pms.backend.entity.Backlog;

public interface BacklogRepository extends JpaRepository<Backlog, Integer> {
     @Query("SELECT b FROM Backlog b WHERE b.project_id = :projectId")
    List<Backlog> findByProject_id(@Param("projectId") int project_id);
}