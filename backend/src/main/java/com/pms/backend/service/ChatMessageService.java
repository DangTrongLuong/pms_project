package com.pms.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pms.backend.dto.MessageDTO;
import com.pms.backend.dto.request.SendMessageRequest;
import com.pms.backend.entity.ChatMessage;
import com.pms.backend.repository.ChatMessageRepository;

@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public MessageDTO saveMessage(String senderEmail, SendMessageRequest request) {
        senderEmail = senderEmail.toLowerCase();
        String receiverEmail = request.getReceiverEmail().toLowerCase();

        ChatMessage message = new ChatMessage();
        message.setProjectId(request.getProjectId());
        message.setSenderEmail(senderEmail);
        message.setReceiverEmail(receiverEmail);
        message.setContent(request.getContent());
        message.setAttachmentUrl(request.getAttachmentUrl());
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);

        ChatMessage savedMessage = chatMessageRepository.save(message);

        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setId(savedMessage.getId());
        messageDTO.setProjectId(savedMessage.getProjectId());
        messageDTO.setSenderEmail(savedMessage.getSenderEmail());
        messageDTO.setReceiverEmail(savedMessage.getReceiverEmail());
        messageDTO.setContent(savedMessage.getContent());
        messageDTO.setTimestamp(savedMessage.getTimestamp());
        messageDTO.setRead(savedMessage.isRead());
        messageDTO.setAttachmentUrl(savedMessage.getAttachmentUrl());

        return messageDTO;
    }

    public List<MessageDTO> getChatHistory(Long projectId, String userEmail, String receiverEmail) {
        userEmail = userEmail.toLowerCase();
        receiverEmail = receiverEmail.toLowerCase();

        // Fetch 2 chiều, sắp xếp timestamp
        List<ChatMessage> messages = chatMessageRepository.findByProjectIdAndEmails(projectId, userEmail, receiverEmail);

        return messages.stream().map(m -> {
            MessageDTO dto = new MessageDTO();
            dto.setId(m.getId());
            dto.setProjectId(m.getProjectId());
            dto.setSenderEmail(m.getSenderEmail());
            dto.setReceiverEmail(m.getReceiverEmail());
            dto.setContent(m.getContent());
            dto.setTimestamp(m.getTimestamp());
            dto.setRead(m.isRead());
            dto.setAttachmentUrl(m.getAttachmentUrl());
            return dto;
        }).sorted((a, b) -> a.getTimestamp().compareTo(b.getTimestamp())) // Đảm bảo sắp xếp
          .collect(Collectors.toList());
    }
    
}