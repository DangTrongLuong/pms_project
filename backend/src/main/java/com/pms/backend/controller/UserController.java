package com.pms.backend.controller;

import com.pms.backend.dto.request.ApiResponsive;
import com.pms.backend.dto.request.EmailCheckRequest;
import com.pms.backend.dto.request.UserCreationRequest;
import com.pms.backend.dto.request.UserUpdateRequest;
import com.pms.backend.dto.response.EmailCheckResponse;
import com.pms.backend.dto.response.UserResponse;
import com.pms.backend.entity.User;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/auth")
public class UserController {
    final UserService userService;
    final UserRepository userRepository;
    @PostMapping("/register")
    ApiResponsive<User> createUser(@RequestBody UserCreationRequest request) {
        ApiResponsive<User> apiResponsive = new ApiResponsive<>();
        apiResponsive.setResult(userService.createRequest(request));
        return apiResponsive;
    }

    @PostMapping("/check-email")
    ResponseEntity<?> checkEmail(@RequestBody EmailCheckRequest request) {
        boolean exists = userService.checkEmailExists(request.getEmail());
        return ResponseEntity.ok(new EmailCheckResponse(exists));
    }

    @GetMapping("/get-users")
    List<User> getUsers(){
        return userService.getUsers();
    }


    @GetMapping("/get-users/{userId}")
    UserResponse getUser(@PathVariable("userId") UUID userId){
        return userService.getUser(userId);
    }


    @PutMapping("/update-user/{userId}")
    UserResponse updateUser(@PathVariable("userId") UUID userId, @RequestBody UserUpdateRequest request){
        return userService.updateUserRequest(userId,request);
    }

    @PutMapping("/update-user/{email}")
    UserResponse updateUserByEmail(@PathVariable("email") String email, @RequestBody UserUpdateRequest request){
        return userService.updateUserRequestEmail(email,request);
    }


    @DeleteMapping("/delete-user/{userId}")
    String deleteUser(@PathVariable("userId") UUID id){
        userService.deleteUser(id);
        return "User has been deleted";
    }
    // Chỉ thay thế các method upload trong UserController.java

@PostMapping("/upload-avatar")
public ResponseEntity<?> uploadAvatar(@RequestParam("avatar") MultipartFile file, @RequestParam("email") String email) {
    try {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("uploads/avatars/" + fileName);
        Files.createDirectories(uploadPath.getParent());
        Files.write(uploadPath, file.getBytes());

        String avatarUrl = "http://localhost:8080/uploads/avatars/" + fileName;
        user.setAvatar_url(avatarUrl);
        userRepository.save(user);

        // Trả về format đúng với frontend expect
        return ResponseEntity.ok().body(Map.of("avatarUrl", avatarUrl));
    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error uploading avatar"));
    }
}

@PostMapping("/upload-background")
public ResponseEntity<?> uploadBackground(@RequestParam("background") MultipartFile file, @RequestParam("email") String email) {
    try {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("uploads/backgrounds/" + fileName);
        Files.createDirectories(uploadPath.getParent());
        Files.write(uploadPath, file.getBytes());

        String backgroundUrl = "http://localhost:8080/uploads/backgrounds/" + fileName;
        user.setBackground_url(backgroundUrl);
        userRepository.save(user);

        // Trả về format đúng với frontend expect
        return ResponseEntity.ok().body(Map.of("backgroundUrl", backgroundUrl));
    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error uploading background"));
    }
}

@PostMapping("/remove-background")
public ResponseEntity<?> removeBackground(@RequestBody Map<String, String> request) {
    try {
        String email = request.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        if (user.getBackground_url() != null) {
            String fileName = user.getBackground_url().substring(user.getBackground_url().lastIndexOf("/") + 1);
            Path filePath = Paths.get("uploads/backgrounds/" + fileName);
            Files.deleteIfExists(filePath);
            user.setBackground_url(null);
            userRepository.save(user);
        }

        return ResponseEntity.ok().body(Map.of("message", "Background removed successfully"));
    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error removing background"));
    }
}
}
