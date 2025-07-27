package com.pms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.pms.backend.entity.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findByProjectId(Integer projectId);

    
}