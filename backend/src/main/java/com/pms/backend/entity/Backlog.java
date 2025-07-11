package com.pms.backend.entity;

import java.time.LocalDate;

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

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "backlog")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Backlog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "backlog_id", updatable = false, nullable = false)
    int id;
    String backlog_name;
    LocalDate start_date;
    LocalDate end_date;
    int work_items;
    String duration;
    String status;
    String sprint_goal;
    String create_by_id;
    String create_by_name;
    @Column(name = "project_id")
    int project_id;
}
