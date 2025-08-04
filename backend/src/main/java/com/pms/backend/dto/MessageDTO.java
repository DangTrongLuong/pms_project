package com.pms.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private Long projectId;
    private String senderEmail;
    private String receiverEmail;
    private String content;
    private LocalDateTime timestamp;
    private boolean read;
    private String attachmentUrl;
}