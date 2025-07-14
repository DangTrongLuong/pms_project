package com.pms.backend.entity;

import com.pms.backend.enums.SprintStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@Entity
@Table(name = "sprints")
@Getter
@Setter
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    // Thêm phương thức để kiểm tra tính toàn vẹn (tùy chọn)
    @PrePersist
    @PreUpdate
    private void validate() {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalStateException("Name cannot be null or empty");
        }
    }
}