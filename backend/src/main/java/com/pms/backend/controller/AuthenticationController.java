package com.pms.backend.controller;

import com.pms.backend.dto.request.ApiResponsive;
import com.pms.backend.dto.request.AuthenticationRequest;
import com.pms.backend.dto.response.AuthenticationResponse;
import com.pms.backend.entity.User;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.service.AuthenticationService;
import io.jsonwebtoken.security.Keys;
import lombok.AccessLevel;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Key;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/api/auth")
public class AuthenticationController {
    final AuthenticationService authenticationService;
     final UserRepository userRepository;
    private static final Key SECRET_KEY = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);
    @PostMapping("/login")
    ApiResponsive<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = authenticationService.authenticate(request);
        return ApiResponsive.<AuthenticationResponse>builder()
                .result(response)
                .build();
    }
}
