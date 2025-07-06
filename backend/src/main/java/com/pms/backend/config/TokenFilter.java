package com.pms.backend.config;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class TokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        // Skip public endpoints
        if (path.startsWith("/api/auth/")
                || path.equals("/")
                || path.startsWith("/uploads/")              
                || path.startsWith("/api/projects/")
                || path.startsWith("/api/members/")) {

            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String userId = (String) request.getSession().getAttribute("userId");
        String userName = (String) request.getSession().getAttribute("name");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (userId != null && userName != null) {
                // Set headers for downstream use
                request.setAttribute("userId", userId);
                request.setAttribute("userName", userName);
                filterChain.doFilter(request, response);
                return;
            }
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid token");
            return;
        }

        String accessToken = authHeader.substring(7);
        if (accessToken.isEmpty()) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        }

        // Validate Google token
        if (accessToken.startsWith("ya29.") || accessToken.length() > 200) {
            try {
                HttpURLConnection conn = (HttpURLConnection) new URL(
                        "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + accessToken).openConnection();
                conn.setRequestMethod("GET");
                int responseCode = conn.getResponseCode();
                if (responseCode != 200) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Google token");
                    return;
                }
            } catch (Exception e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error validating Google token");
                return;
            }
        }

        // Set userId and userName from session
        if (userId != null && userName != null) {
            request.setAttribute("userId", userId);
            request.setAttribute("userName", userName);
        }

        filterChain.doFilter(request, response);
    }
}