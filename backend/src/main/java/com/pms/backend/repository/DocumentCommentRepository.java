package com.pms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.pms.backend.entity.DocumentComment;

@Repository
public interface DocumentCommentRepository extends JpaRepository<DocumentComment, Integer> {
    List<DocumentComment> findByDocumentId(Integer documentId);
    @Modifying
    @Query("DELETE FROM DocumentComment dc WHERE dc.documentId = :documentId")
    void deleteByDocumentId(Integer documentId);
}