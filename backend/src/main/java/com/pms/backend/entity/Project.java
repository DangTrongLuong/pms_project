package com.pms.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "projects")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Project {
    @Id
    @Column(name = "project_id", updatable = false, nullable = false)
    int id;
    String project_name;
    String created_by_id;
    String created_by_name;
    String color;
    String short_name;
    String project_type;
    String description;
    LocalDate created_at;
    @Column(name="members")
    String members;
    String leader;
}
