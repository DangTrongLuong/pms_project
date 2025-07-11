package com.pms.backend.config;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.Key;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class TokenFilter extends OncePerRequestFilter {

    private static final Key SECRET_KEY = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        // Skip public endpoints
        if (path.startsWith("/api/auth/")
                || path.equals("/")
                || path.startsWith("/uploads/")
                || path.startsWith("/api/projects/")
                || path.startsWith("/api/members/")
                || path.startsWith("/api/backlog/")
                || path.startsWith("/api/admin/auth/login")) {

            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String userId = (String) request.getSession().getAttribute("userId");
        String userName = (String) request.getSession().getAttribute("name");
        String role = (String) request.getSession().getAttribute("role");

        if (path.startsWith("/api/admin/") && !"ADMIN".equals(role)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied: Admin role required");
            return;
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            if (!accessToken.isEmpty()) {
                try {
                    // Validate JWT token
                    Jwts.parserBuilder()
                            .setSigningKey(SECRET_KEY)
                            .build()
                            .parseClaimsJws(accessToken);
                    request.setAttribute("userId", userId);
                    request.setAttribute("userName", userName);
                    request.setAttribute("role", role);
                    filterChain.doFilter(request, response);
                    return;
                } catch (Exception e) {
                    // Validate Google token if JWT fails
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
                            request.setAttribute("userId", userId);
                            request.setAttribute("userName", userName);
                            request.setAttribute("role", role);
                            filterChain.doFilter(request, response);
                            return;
                        } catch (IOException ex) {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error validating Google token");
                            return;
                        }
                    } else {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
                        return;
                    }
                }
            }
        }

        // Allow requests if userId and userName are present in session
        if (userId != null && userName != null) {
            request.setAttribute("userId", userId);
            request.setAttribute("userName", userName);
            request.setAttribute("role", role);
            filterChain.doFilter(request, response);
            return;
        }

        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid token");
    }
}
