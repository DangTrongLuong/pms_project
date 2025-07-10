package com.pms.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pms.backend.entity.Backlog;

public interface BacklogRepository extends JpaRepository<Backlog, Integer> {
}