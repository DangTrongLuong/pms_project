package com.pms.backend.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pms.backend.dto.request.DocumentAssignmentRequest;
import com.pms.backend.dto.request.DocumentCommentRequest;
import com.pms.backend.dto.request.DocumentCreationRequest;
import com.pms.backend.dto.response.DocumentAssignmentResponse;
import com.pms.backend.dto.response.DocumentCommentResponse;
import com.pms.backend.dto.response.DocumentResponse;
import com.pms.backend.entity.Document;
import com.pms.backend.entity.DocumentAssignment;
import com.pms.backend.entity.DocumentComment;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.Task;
import com.pms.backend.entity.User;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.DocumentMapper;
import com.pms.backend.repository.DocumentAssignmentRepository;
import com.pms.backend.repository.DocumentCommentRepository;
import com.pms.backend.repository.DocumentRepository;
import com.pms.backend.repository.MemberRepository;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.TaskRepository;
import com.pms.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentService {

    DocumentRepository documentRepository;
    DocumentCommentRepository documentCommentRepository;
    DocumentAssignmentRepository documentAssignmentRepository;
    ProjectRepository projectRepository;
    TaskRepository taskRepository;
    UserRepository userRepository;
    MemberRepository memberRepository;
    DocumentMapper documentMapper;

    public List<DocumentResponse> uploadDocuments(Integer projectId, DocumentCreationRequest request, MultipartFile[] files, String userId) {
        log.info("Uploading documents for projectId: {} by userId: {}", projectId, userId);

        // Verify project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        // Verify uploader is a project member
        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (!memberRepository.existsByEmailAndProjectId(uploader.getEmail(), String.valueOf(projectId))) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }

        // Verify task if provided
        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new AppException(ErrorStatus.TASK_NOT_FOUND));
            if (task.getProject().getId() != projectId) {
                throw new AppException(ErrorStatus.TASK_NOT_FOUND);
            }
        }

        List<DocumentResponse> responses = new ArrayList<>();
        String[] allowedTypes = {"pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "xd", "css", "js"};

        // Define a stable upload directory with documents subfolder
        String uploadDir = "D:/pms_project/backend/uploads/documents";

        for (MultipartFile file : files) {
            // Validate file
            if (file == null || file.isEmpty()) {
                throw new AppException(ErrorStatus.INVALID_FILE, "Tệp rỗng hoặc không hợp lệ");
            }

            String fileExtension = getFileExtension(file.getOriginalFilename()).toLowerCase();
            boolean isValidType = false;
            for (String type : allowedTypes) {
                if (fileExtension.equals(type)) {
                    isValidType = true;
                    break;
                }
            }
            if (!isValidType) {
                throw new AppException(ErrorStatus.INVALID_FILE_TYPE, "Định dạng tệp không được hỗ trợ: " + fileExtension);
            }

            // Save file to disk
            String fileName = System.currentTimeMillis() + "-" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;
            try {
                File dest = new File(filePath);
                File parentDir = dest.getParentFile();
                if (!parentDir.exists()) {
                    if (!parentDir.mkdirs()) {
                        throw new IOException("Không thể tạo thư mục: " + parentDir.getAbsolutePath());
                    }
                }
                if (!parentDir.canWrite()) {
                    throw new IOException("Không có quyền ghi vào thư mục: " + parentDir.getAbsolutePath());
                }
                file.transferTo(dest);
            } catch (IOException e) {
                log.error("File upload failed for file {}: {}", file.getOriginalFilename(), e.getMessage());
                throw new AppException(ErrorStatus.FILE_UPLOAD_FAILED, "Lỗi khi lưu tệp: " + e.getMessage());
            }

            // Save document
            Document document = new Document();
            document.setProjectId(projectId);
            document.setTaskId(request.getTaskId());
            document.setName(file.getOriginalFilename());
            document.setUploaderId(userId);
            document.setSize(file.getSize());
            document.setType(fileExtension);
            document.setFilePath(filePath);
            document.setUploadDate(LocalDateTime.now());
            Document savedDocument = documentRepository.save(document);

            // Assign uploader as Owner
            DocumentAssignment assignment = new DocumentAssignment();
            assignment.setDocumentId(savedDocument.getId());
            assignment.setUserId(userId);
            assignment.setRole("Owner");
            documentAssignmentRepository.save(assignment);

            // Prepare response
            List<DocumentCommentResponse> comments = List.of();
            List<DocumentAssignmentResponse> assignments = List.of(
                    documentMapper.toDocumentAssignmentResponse(assignment, uploader)
            );

            responses.add(documentMapper.toDocumentResponse(savedDocument, uploader, task, comments, assignments));
        }

        return responses;
    }

    public List<DocumentResponse> getDocumentsByProject(Integer projectId, String userId) {
        log.info("Fetching documents for projectId: {} by userId: {}", projectId, userId);

        projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (!memberRepository.existsByEmailAndProjectId(requester.getEmail(), String.valueOf(projectId))) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }

        List<Document> documents = documentRepository.findByProjectId(projectId);
        return documents.stream().map(document -> {
            User uploader = userRepository.findById(document.getUploaderId()).orElse(null);
            Task task = document.getTaskId() != null ? taskRepository.findById(document.getTaskId()).orElse(null) : null;
            List<DocumentCommentResponse> comments = documentCommentRepository.findByDocumentId(document.getId())
                    .stream()
                    .map(comment -> {
                        User commentUser = userRepository.findById(comment.getUserId()).orElse(null);
                        return documentMapper.toDocumentCommentResponse(comment, commentUser);
                    })
                    .collect(Collectors.toList());
            List<DocumentAssignmentResponse> assignments = documentAssignmentRepository.findByDocumentId(document.getId())
                    .stream()
                    .map(assignment -> {
                        User assignedUser = userRepository.findById(assignment.getUserId()).orElse(null);
                        return documentMapper.toDocumentAssignmentResponse(assignment, assignedUser);
                    })
                    .collect(Collectors.toList());
            return documentMapper.toDocumentResponse(document, uploader, task, comments, assignments);
        }).collect(Collectors.toList());
    }

    public DocumentCommentResponse addComment(Integer documentId, DocumentCommentRequest request, String userId) {
        log.info("Adding comment to documentId: {} by userId: {}", documentId, userId);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorStatus.DOCUMENT_NOT_FOUND));

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (!memberRepository.existsByEmailAndProjectId(requester.getEmail(), String.valueOf(document.getProjectId()))) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }

        if (request.getText() == null || request.getText().trim().isEmpty()) {
            throw new AppException(ErrorStatus.INVALID_COMMENT);
        }

        DocumentComment comment = new DocumentComment();
        comment.setDocumentId(documentId);
        comment.setUserId(userId);
        comment.setText(request.getText().trim());
        comment.setTimestamp(LocalDateTime.now());
        DocumentComment savedComment = documentCommentRepository.save(comment);

        return documentMapper.toDocumentCommentResponse(savedComment, requester);
    }

    public DocumentAssignmentResponse assignUser(Integer documentId, DocumentAssignmentRequest request, String userId) {
        log.info("Assigning user to documentId: {} by userId: {}", documentId, userId);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorStatus.DOCUMENT_NOT_FOUND));

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (!memberRepository.existsByEmailAndProjectId(requester.getEmail(), String.valueOf(document.getProjectId()))) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }

        User assignedUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (!memberRepository.existsByEmailAndProjectId(request.getEmail(), String.valueOf(document.getProjectId()))) {
            throw new AppException(ErrorStatus.MEMBER_NOT_FOUND);
        }

        if (!List.of("Owner", "Reviewer").contains(request.getRole())) {
            throw new AppException(ErrorStatus.INVALID_ROLE);
        }

        Optional<DocumentAssignment> existingAssignment = documentAssignmentRepository.findByDocumentIdAndUserId(documentId, assignedUser.getId());
        DocumentAssignment assignment;
        if (existingAssignment.isPresent()) {
            assignment = existingAssignment.get();
            assignment.setRole(request.getRole());
            assignment.setAssignedDate(LocalDateTime.now());
        } else {
            assignment = new DocumentAssignment();
            assignment.setDocumentId(documentId);
            assignment.setUserId(assignedUser.getId());
            assignment.setRole(request.getRole());
            assignment.setAssignedDate(LocalDateTime.now());
        }
        DocumentAssignment savedAssignment = documentAssignmentRepository.save(assignment);

        return documentMapper.toDocumentAssignmentResponse(savedAssignment, assignedUser);
    }

    public void removeAssignment(Integer documentId, String email, String userId) {
        log.info("Removing assignment from documentId: {} for email: {} by userId: {}", documentId, email, userId);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorStatus.DOCUMENT_NOT_FOUND));

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (!memberRepository.existsByEmailAndProjectId(requester.getEmail(), String.valueOf(document.getProjectId()))) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }

        User assignedUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        documentAssignmentRepository.deleteByDocumentIdAndUserId(documentId, assignedUser.getId());
    }

    public List<DocumentResponse> searchUsers(String query, String userId) {
        log.info("Searching users with query: {} by userId: {}", query, userId);

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getEmail().toLowerCase().contains(query.toLowerCase())
                || user.getName().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());

        return users.stream().map(user -> {
            DocumentResponse response = new DocumentResponse();
            response.setUploaderId(user.getId());
            response.setUploaderName(user.getName());
            response.setUploaderAvatar(user.getAvatar_url());
            return response;
        }).collect(Collectors.toList());
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}
