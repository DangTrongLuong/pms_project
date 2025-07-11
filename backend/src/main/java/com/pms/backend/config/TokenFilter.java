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
        String method = request.getMethod();

        // Bỏ qua các yêu cầu OPTIONS và endpoint công khai
        if (method.equals("OPTIONS") ||
            path.startsWith("/api/auth/") ||
            path.equals("/") ||
            path.startsWith("/uploads/") ||
            path.startsWith("/api/projects/") ||
            path.startsWith("/api/members/") ||
            path.startsWith("/api/backlog/")) {
            response.setStatus(HttpServletResponse.SC_OK);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String userId = (String) request.getSession().getAttribute("userId");
        String userName = (String) request.getSession().getAttribute("name");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (userId != null && userName != null) {
                request.setAttribute("userId", userId);
                request.setAttribute("userName", userName);
                filterChain.doFilter(request, response);
                return;
            }
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\": 401, \"message\": \"Missing or invalid token\"}");
            return;
        }

        String accessToken = authHeader.substring(7);
        if (accessToken.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\": 401, \"message\": \"Invalid token\"}");
            return;
        }

        // Validate Google token
        if (accessToken.startsWith("ya29.") || accessToken.length() > 200) {
            try {
                HttpURLConnection conn = (HttpURLConnection) new URL(
                        "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + accessToken).openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                int responseCode = conn.getResponseCode();
                if (responseCode != 200) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"status\": 401, \"message\": \"Invalid Google token\"}");
                    return;
                }
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"status\": 401, \"message\": \"Error validating Google token: " + e.getMessage() + "\"}");
                return;
            }
        }

        if (userId != null && userName != null) {
            request.setAttribute("userId", userId);
            request.setAttribute("userName", userName);
        }

        filterChain.doFilter(request, response);
    }
}