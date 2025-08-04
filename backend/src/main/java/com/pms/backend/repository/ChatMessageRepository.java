package com.pms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pms.backend.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @Query("SELECT m FROM ChatMessage m WHERE m.projectId = :projectId AND ((m.senderEmail = :sender AND m.receiverEmail = :receiver) OR (m.senderEmail = :receiver AND m.receiverEmail = :sender)) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(Long projectId, String sender, String receiver);

    @Query("SELECT m FROM ChatMessage m WHERE m.projectId = :projectId " +
           "AND ((m.senderEmail = :userEmail AND m.receiverEmail = :receiverEmail) " +
           "OR (m.senderEmail = :receiverEmail AND m.receiverEmail = :userEmail)) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessage> findByProjectIdAndEmails(
            @Param("projectId") Long projectId,
            @Param("userEmail") String userEmail,
            @Param("receiverEmail") String receiverEmail
    );
}
