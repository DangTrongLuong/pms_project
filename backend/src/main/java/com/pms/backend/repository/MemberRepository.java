package com.pms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pms.backend.entity.Members;

public interface MemberRepository extends JpaRepository<Members, Integer> {
    List<Members> findByProjectId(String projectId);
    boolean existsByEmailAndProjectId(String email, String projectId);
    Optional<Members> findByEmailAndProjectId(String email, String projectId);
    @Query("SELECT m FROM Members m WHERE m.email = :email")
    List<Members> findAllByEmail(String email);

    @Query("SELECT COUNT(m) > 0 FROM Members m WHERE m.email = :email AND m.projectId = :projectId AND m.role = :role")
    boolean existsByEmailAndProjectIdAndRole(@Param("email") String email, @Param("projectId") String projectId, @Param("role") String role);
}