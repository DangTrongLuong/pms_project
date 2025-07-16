package com.pms.backend.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pms.backend.entity.Document;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.Task;
import com.pms.backend.entity.User;
import com.pms.backend.repository.DocumentRepository;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.TaskRepository;
import com.pms.backend.repository.UserRepository;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    private static final String UPLOAD_DIR = "/backend/uploads/documents/";

    public Document uploadDocument(MultipartFile file, String userId, int projectId, Integer taskId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        Task task = taskId != null ? taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found")) : null;

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File destFile = new File(UPLOAD_DIR + fileName);
        file.transferTo(destFile);

        Document document = new Document();
        document.setFileName(fileName);
        document.setFilePath(destFile.getPath());
        document.setUploadedBy(user);
        document.setProject(project);
        document.setTask(task);
        document.setUploadedAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> getDocumentsByProjectId(int projectId) {
        return documentRepository.findAll().stream()
                .filter(doc -> doc.getProject().getId() == projectId)
                .toList();
    }

    public List<Document> getDocumentsByTaskId(Integer taskId) {
        return documentRepository.findByTaskId(taskId);
    }
}
