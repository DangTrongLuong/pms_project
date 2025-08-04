package com.pms.backend.dto.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MemberUpdateRequest {
    String role; // Vai trò của thành viên (ví dụ: USER, LEADER)
    String name; // Tùy chọn: cập nhật tên thành viên
    String email; // Tùy chọn: cập nhật email thành viên
    String avatarUrl; // Tùy chọn: cập nhật URL avatar
}