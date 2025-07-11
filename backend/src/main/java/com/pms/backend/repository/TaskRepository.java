package com.pms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pms.backend.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Integer> {

    List<Task> findByBacklogId(Integer backlogId);
}
