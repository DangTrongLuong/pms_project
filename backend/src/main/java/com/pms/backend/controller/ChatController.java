package com.pms.backend.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.dto.MessageDTO;
import com.pms.backend.service.ChatMessageService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    @Autowired
    private ChatMessageService chatMessageService;

    @GetMapping("/history")
    public List<MessageDTO> getChatHistory(
            @RequestParam Long projectId,
            @RequestParam String receiverEmail) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = getEmailFromAuthentication(authentication);

        if (userEmail == null || userEmail.isEmpty()) {
            System.err.println("Cannot get userEmail from authentication for history");
            return Collections.emptyList();
        }

        userEmail = userEmail.toLowerCase();
        return chatMessageService.getChatHistory(projectId, userEmail, receiverEmail.toLowerCase());
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