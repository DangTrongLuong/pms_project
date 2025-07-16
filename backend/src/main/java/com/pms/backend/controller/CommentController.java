package com.pms.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.entity.Comment;
import com.pms.backend.service.CommentService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<?> addComment(
            @RequestParam(value = "documentId", required = false) Long documentId,
            @RequestParam(value = "taskId", required = false) Integer taskId,
            @RequestParam String content,
            @RequestHeader("userId") String userId) {
        if (documentId == null && taskId == null) {
            return ResponseEntity.badRequest().body("Phải cung cấp documentId hoặc taskId");
        }
        Comment comment = commentService.addComment(documentId, taskId, content, userId);
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<List<Comment>> getCommentsByDocumentId(@PathVariable Long documentId) {
        List<Comment> comments = commentService.getCommentsByDocumentId(documentId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Comment>> getCommentsByTaskId(@PathVariable Integer taskId) {
        List<Comment> comments = commentService.getCommentsByTaskId(taskId);
        return ResponseEntity.ok(comments);
    }
}