package com.pms.backend.dto.request;

import lombok.Data;

@Data
public class SendMessageRequest {
    private Long projectId;
    private String receiverEmail;
    private String content;
    private String attachmentUrl;
}