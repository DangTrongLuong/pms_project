package com.pms.backend.service;

import com.pms.backend.entity.Task;
import com.pms.backend.entity.User;
import com.pms.backend.entity.Comment;
import com.pms.backend.entity.Document;
import com.pms.backend.repository.CommentRepository;
import com.pms.backend.repository.DocumentRepository;
import com.pms.backend.repository.TaskRepository;
import com.pms.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public Comment addComment(Long documentId, Integer taskId, String content, String userId) {
        Document document = documentId != null ? documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found")) : null;
        Task task = taskId != null ? taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found")) : null;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (document == null && task == null) {
            throw new IllegalArgumentException("Must provide either documentId or taskId");
        }

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setDocument(document);
        comment.setTask(task);
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByDocumentId(Long documentId) {
        return commentRepository.findByDocumentId(documentId);
    }

    public List<Comment> getCommentsByTaskId(Integer taskId) {
        return commentRepository.findByTaskId(taskId);
    }
}