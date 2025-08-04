package com.pms.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;

import com.pms.backend.dto.MessageDTO;
import com.pms.backend.dto.request.SendMessageRequest;
import com.pms.backend.service.ChatMessageService;

@Controller
public class MessageWebSocketController {
    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    private ChatMessageService service;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload SendMessageRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String senderEmail = getEmailFromAuthentication(authentication);

        if (senderEmail == null || senderEmail.isEmpty()) {
            System.err.println("Cannot get senderEmail from authentication");
            return;
        }

        senderEmail = senderEmail.toLowerCase();

        MessageDTO saved = service.saveMessage(senderEmail, request);
        String receiverEmail = request.getReceiverEmail().toLowerCase();
        String chatKey = Math.min(senderEmail.hashCode(), receiverEmail.hashCode()) + "-" + Math.max(senderEmail.hashCode(), receiverEmail.hashCode());
        String destination = "/topic/chat/" + request.getProjectId() + "/" + chatKey;
        template.convertAndSend(destination, saved);
    }

    private String getEmailFromAuthentication(Authentication authentication) {
        if (authentication instanceof OAuth2AuthenticationToken) {
            OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
            return oidcUser.getEmail();
        } else if (authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userDetails.getUsername(); // Username là email cho tk thường
        } else if (authentication != null) {
            return authentication.getName();
        }
        return null;
    }
}