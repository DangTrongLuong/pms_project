package com.pms.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "chat_message")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Long id;

    @Column(name = "project_id", nullable = false)
    Long projectId;

    @Column(name = "sender_email", nullable = false)
    String senderEmail;

    @Column(name = "receiver_email", nullable = false)
    String receiverEmail;

    @Column(name = "content", nullable = false, length = 1000)
    String content;

    @Column(name = "timestamp", nullable = false)
    LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "is_read", nullable = false)
    boolean read = false;

    @Column(name = "attachment_url")
    String attachmentUrl;
}
