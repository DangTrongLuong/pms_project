package com.pms.backend.exception;

public enum ErrorStatus {
    INVALID_KEY(400, "Khóa thông điệp không hợp lệ!"),
    USER_EXISTED(400, "Người dùng đã tồn tại!"),
    USER_NOT_EXISTED(400, "Người dùng không tồn tại!"),
    USER_NOTFOUND(400, "Không tìm thấy người dùng!"),
    PROJECT_NOTFOUND(400, "Không tìm thấy dự án!"),
    INVALID_CREDENTIALS(400, "Thông tin đăng nhập không hợp lệ!"),
    INVALID_INPUT(400, "Dữ liệu đầu vào không hợp lệ!"),
    INTERNAL_SERVER_ERROR(500, "Lỗi máy chủ nội bộ!"), // Sửa status thành 500 cho phù hợp
    PROJECT_NOT_FOUND(400, "Không tìm thấy dự án!"), // Trùng với PROJECT_NOTFOUND, xem xét gộp
    PROJECT_NOT_EXISTED(400, "Dự án không tồn tại!"), // Trùng với PROJECT_NOTFOUND, xem xét gộp
    UNAUTHORIZED(401, "Không được phép truy cập!"),
    MEMBER_NOT_FOUND(404, "Không tìm thấy thành viên!"),
    MEMBER_ALREADY_EXISTS(409, "Thành viên đã tồn tại trong dự án!"),
    SPRINT_NOT_FOUND(404, "Không tìm thấy sprint!"),
    INVALID_SPRINT_STATUS(400, "Trạng thái sprint không hợp lệ!"),
    SPRINT_ALREADY_EXISTS(409, "Sprint đã tồn tại!"),
    TASK_NOT_FOUND(404, "Không tìm thấy nhiệm vụ!"),
    INVALID_TASK_STATUS(400, "Trạng thái nhiệm vụ không hợp lệ!"), // Thêm mới
    TASK_CREATION_FAILED(400, "Tạo nhiệm vụ thất bại!"),
    PROJECT_DELETE_FAILED(400, "Xóa dự án thất bại!"),
    PROJECT_UPDATE_FAILED(400, "Cập nhật dự án thất bại!");

    private final int status;
    private final String message;

    ErrorStatus(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}