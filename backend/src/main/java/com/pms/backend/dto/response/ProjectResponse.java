package com.pms.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectResponse {
    int id;
    String project_name;
    String created_by_id;
    String created_by_name;
    String project_type;
    String description;
    String members;
    String leader;
    LocalDate created_at;
}