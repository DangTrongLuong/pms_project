package com.pms.backend.controller;

import com.pms.backend.entity.Document;
import com.pms.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "userId", required = false) String userId,
            @RequestParam("projectId") int projectId,
            @RequestParam(value = "taskId", required = false) Integer taskId) throws IOException {
        Document document = documentService.uploadDocument(file, userId, projectId, taskId);
        return ResponseEntity.ok(document);
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Document>> getDocumentsByProjectId(@PathVariable int projectId) {
        List<Document> documents = documentService.getDocumentsByProjectId(projectId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Document>> getDocumentsByTaskId(@PathVariable Integer taskId) {
        List<Document> documents = documentService.getDocumentsByTaskId(taskId);
        return ResponseEntity.ok(documents);
    }
}