package com.pms.backend.entity;

import com.pms.backend.enums.SprintStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "backlog")
@Getter
@Setter
public class Backlog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "backlog_id")
    private Integer id;

    @Column(name = "backlog_name")
    private String backlogName;

    @Column(name = "create_by_id")
    private String createById;

    @Column(name = "create_by_name")
    private String createByName;

    @Column(name = "duration")
    private String duration;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "sprint_goal")
    private String sprintGoal;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SprintStatus status;

    @Column(name = "work_items")
    private Integer workItems;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}