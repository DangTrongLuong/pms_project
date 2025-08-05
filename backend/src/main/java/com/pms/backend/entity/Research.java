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
@Table(name = "research")
public class Research {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "message", columnDefinition = "VARCHAR(255)")
    private String message;

    @Column(name = "message_by_id", columnDefinition = "VARCHAR(255)")
    private String messageById;

    @Column(name = "message_by_name", columnDefinition = "VARCHAR(255)")
    private String messageByName;

    @Column(name = "output", columnDefinition = "VARCHAR(255)")
    private String output;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "sended_by", columnDefinition = "VARCHAR(255)")
    private String sendedBy;

    @ManyToOne
    @JoinColumn(name = "message_by_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User userId;
}