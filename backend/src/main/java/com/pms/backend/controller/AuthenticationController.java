package com.pms.backend.controller;

import java.security.Key;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.pms.backend.config.JwtTokenUtil;
import com.pms.backend.dto.request.ApiResponsive;
import com.pms.backend.dto.request.AuthenticationRequest;
import com.pms.backend.dto.response.AuthenticationResponse;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.service.AuthenticationService;

import io.jsonwebtoken.security.Keys;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/api/auth")
public class AuthenticationController {

    final AuthenticationService authenticationService;
    final UserRepository userRepository;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    @Qualifier("googleJwtDecoder")
    private JwtDecoder googleJwtDecoder;
    private static final Key SECRET_KEY = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);

    @PostMapping("/login")
    ApiResponsive<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = authenticationService.authenticate(request);
        return ApiResponsive.<AuthenticationResponse>builder()
                .result(response)
                .build();
    }

   @PostMapping("/exchange-token")
public ResponseEntity<?> exchangeGoogleTokenForJwt(@RequestBody Map<String, String> request) {
    System.out.println("Received exchange-token request");
    
    try {
        String googleToken = request.get("googleToken");
        System.out.println("Google token received: " + (googleToken != null ? "Yes" : "No"));
        
        if (googleToken == null || googleToken.trim().isEmpty()) {
            return ResponseEntity.status(400).body("Google token is required");
        }
       
        // Use access token to fetch user info from Google
        System.out.println("Fetching user info from Google...");
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + googleToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> googleResponse = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v3/userinfo", 
            HttpMethod.GET, 
            entity, 
            Map.class
        );
        
        if (!googleResponse.getStatusCode().is2xxSuccessful()) {
            throw new Exception("Failed to fetch user info from Google: " + googleResponse.getStatusCode());
        }

        Map<String, Object> userInfo = googleResponse.getBody();
        String email = (String) userInfo.get("email");
        System.out.println("Fetched email from Google: " + email);
       
        // Check if user exists in system
        System.out.println("Loading user details for: " + email);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        System.out.println("User found: " + userDetails.getUsername());
       
        // Generate local JWT token
        System.out.println("Generating local JWT token...");
        String localJwtToken = jwtTokenUtil.generateToken(email);
        System.out.println("Local JWT token generated successfully");
       
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", localJwtToken);
        response.put("userEmail", email);
        response.put("authProvider", "GOOGLE");
       
        return ResponseEntity.ok(response);
       
    } catch (Exception e) {
        System.err.println("Token exchange error: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(401).body("Invalid Google token: " + e.getMessage());
    }
}
}
