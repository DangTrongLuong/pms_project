package com.pms.backend.dto.response;

import java.time.LocalDate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BacklogResponse {
    int id;
    String backlog_name;
    LocalDate start_date;
    LocalDate end_date;
    int work_items;
    String status;
    String sprint_goal;
    String create_by_id;
    String create_by_name;
    int project_id;
}
