package com.pms.backend.exception;


public enum ErrorStatus {
    INVALID_KEY(400, "Invalid message key!"),
    USER_EXISTED(400, "User existed!"),
    USER_NOT_EXISTED(400, "User not exists!"),
    USER_NOTFOUND(400, "User not found!"),
    PROJECT_NOTFOUND(400, "Project not found!"),
    INVALID_CREDENTIALS(400, "Invalid Credentials!"),
    INVALID_INPUT(400, "Invalid Input!"),
    INTERNAL_SERVER_ERROR(400, "Internal Server Error!"),
    PROJECT_NOT_FOUND(400, "Project not found!"),
    PROJECT_NOT_EXISTED(400, "Project not existed!"),
    UNAUTHORIZED(400, "Unauthorized!"),
    MEMBER_NOT_FOUND(404, "Member not found"),
    MEMBER_ALREADY_EXISTS(409, "Member already exists in the project"),

    ;

    private int status;
    private String message;

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
