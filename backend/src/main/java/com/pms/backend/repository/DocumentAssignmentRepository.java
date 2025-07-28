package com.pms.backend.repository;

import com.pms.backend.entity.DocumentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentAssignmentRepository extends JpaRepository<DocumentAssignment, Integer> {
    List<DocumentAssignment> findByDocumentId(Integer documentId);
    Optional<DocumentAssignment> findByDocumentIdAndUserId(Integer documentId, String userId);
    void deleteByDocumentIdAndUserId(Integer documentId, String userId);

    @Modifying
    @Query("DELETE FROM DocumentAssignment da WHERE da.documentId = :documentId")
    void deleteByDocumentId(Integer documentId);
}