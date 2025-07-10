package com.pms.backend.dto.request;

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
public class BacklogUpdateRequest {
    String backlog_name;
     String duration;
     LocalDate start_date;
     LocalDate end_date;
    String sprint_goal;
     String status;
}
