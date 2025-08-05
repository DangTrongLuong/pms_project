package com.pms.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "conversation")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "conversation_id", referencedColumnName = "id")
    private ListConversation listConversation;

    @Column(name = "message", columnDefinition = "NVARCHAR(255)")
    private String message;

    @Column(name = "message_by", columnDefinition = "NVARCHAR(255)")
    private String messageBy;

    @Column(name = "sended_at")
    private LocalDate sendedAt;
}