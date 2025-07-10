package com.pms.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.dto.request.BacklogCreationRequest;
import com.pms.backend.dto.request.BacklogUpdateRequest;
import com.pms.backend.dto.response.BacklogResponse;
import com.pms.backend.service.BacklogService;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/backlog")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BacklogController {

    BacklogService backlogService;

    @Autowired
    public BacklogController(BacklogService backlogService) {
        this.backlogService = backlogService;
    }

    @PostMapping("/create-backlog")
    public ResponseEntity<BacklogResponse> createBacklog(@RequestBody BacklogCreationRequest request, @RequestHeader("userId") String userId) {
        return ResponseEntity.ok(backlogService.createBacklog(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BacklogResponse> getBacklog(@PathVariable int id) {
        return ResponseEntity.ok(backlogService.getBacklog(id));
    }

    @GetMapping("/get-all-backlogs")
    public ResponseEntity<Iterable<BacklogResponse>> getAllBacklogs() {
        return ResponseEntity.ok(backlogService.getAllBacklogs());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BacklogResponse> updateBacklog(@PathVariable int id, @RequestBody BacklogUpdateRequest request, @RequestHeader("userId") String userId) {
        return ResponseEntity.ok(backlogService.updateBacklog(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBacklog(@PathVariable int id, @RequestHeader("userId") String userId) {
        backlogService.deleteBacklog(id, userId);
        return ResponseEntity.noContent().build();
    }
}