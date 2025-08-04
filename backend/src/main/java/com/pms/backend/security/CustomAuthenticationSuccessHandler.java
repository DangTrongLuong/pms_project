package com.pms.backend.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.pms.backend.config.JwtTokenUtil;
import com.pms.backend.entity.User;
import com.pms.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String email = oidcUser.getEmail();

        // Lưu hoặc cập nhật thông tin người dùng
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(oidcUser.getFullName());
            newUser.setAvatar_url(oidcUser.getPicture());
            return userRepository.save(newUser);
        });

        String token = jwtTokenUtil.generateToken(email);
        String redirectUrl = String.format("http://localhost:3000/login?token=%s&email=%s&userId=%s", 
                token, email, user.getId());
        response.sendRedirect(redirectUrl);
    }
}