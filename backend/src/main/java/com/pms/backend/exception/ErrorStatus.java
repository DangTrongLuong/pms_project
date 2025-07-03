package com.pms.backend.exception;


public enum ErrorStatus {
    INVALID_KEY(400, "Invalid message key!"),
    USER_EXISTED(400, "User existed!"),
    USER_NOT_EXISTED(400, "User not exists!"),
    USER_NOTFOUND(400, "User not found!"),
    PROJECT_NOTFOUND(400, "Project not found!"),
    INVALID_CREDENTIALS(400, "Invalid Credentials!")
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
