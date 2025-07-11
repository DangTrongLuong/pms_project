
package com.pms.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.dto.request.BacklogCreationRequest;
import com.pms.backend.dto.request.BacklogUpdateRequest;
import com.pms.backend.dto.response.BacklogResponse;
import com.pms.backend.service.BacklogService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/backlog")
public class BacklogController {

    private final BacklogService backlogService;

    @Autowired
    public BacklogController(BacklogService backlogService) {
        this.backlogService = backlogService;
    }

    @PostMapping("/create-backlog")
    public ResponseEntity<BacklogResponse> createBacklog(
            @RequestBody BacklogCreationRequest request,
            HttpServletRequest httpRequest) {
        String userId = httpRequest.getHeader("userId");
        return ResponseEntity.ok(backlogService.createBacklog(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BacklogResponse> getBacklog(@PathVariable int id) {
        return ResponseEntity.ok(backlogService.getBacklog(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<BacklogResponse>> getBacklogsByProject(@PathVariable int projectId) {
        return ResponseEntity.ok(backlogService.getBacklogsByProject(projectId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BacklogResponse> updateBacklog(
            @PathVariable int id,
            @RequestBody BacklogUpdateRequest request,
            HttpServletRequest httpRequest) {
        String userId = httpRequest.getHeader("userId");
        return ResponseEntity.ok(backlogService.updateBacklog(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBacklog(
            @PathVariable int id,
            HttpServletRequest httpRequest) {
        String userId = httpRequest.getHeader("userId");
        backlogService.deleteBacklog(id, userId);
        return ResponseEntity.noContent().build();
    }
}
