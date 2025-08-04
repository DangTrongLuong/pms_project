package com.pms.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pms.backend.dto.request.MemberCreationRequest;
import com.pms.backend.dto.request.MemberUpdateRequest;
import com.pms.backend.dto.request.NotificationRequest;
import com.pms.backend.dto.response.MembersResponse;
import com.pms.backend.entity.Members;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.User;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.MembersMapper;
import com.pms.backend.repository.MemberRepository;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.repository.NotificationRepository;
import com.pms.backend.entity.Notification;
import com.pms.backend.service.NotificationService;
import com.pms.backend.enums.NotificationStatus;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MembersService {
    MemberRepository memberRepository;
    UserRepository userRepository;
    ProjectRepository projectRepository;
    NotificationRepository notificationRepository;
    NotificationService notificationService;
    MembersMapper membersMapper;

    public void updateMemberAvatar(String email, String newAvatarUrl) {
        log.info("Updating avatarUrl for email: {} with newAvatarUrl: {}", email, newAvatarUrl);
        List<Members> members = memberRepository.findAll().stream()
                .filter(m -> m.getEmail().equals(email))
                .collect(Collectors.toList());
        for (Members member : members) {
            member.setAvatarUrl(newAvatarUrl);
            memberRepository.save(member);
        }
    }

    public void addMember(int projectId, MemberCreationRequest request, String userId) {
        log.info("Sending invitation to projectId: {} by userId: {}", projectId, userId);

        // Kiểm tra dự án tồn tại
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        // Kiểm tra quyền: Chỉ trưởng nhóm hoặc người tạo dự án được mời
        User inviter = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (!project.getCreated_by_id().equals(userId) && 
            !memberRepository.findByEmailAndProjectId(inviter.getEmail(), String.valueOf(projectId))
                .map(m -> m.getRole().equals("LEADER"))
                .orElse(false)) {
            throw new AppException(ErrorStatus.UNAUTHORIZED, "Only project leader or creator can invite members");
        }

        // Kiểm tra người được mời
        User invitedUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (memberRepository.existsByEmailAndProjectId(request.getEmail(), String.valueOf(projectId))) {
            throw new AppException(ErrorStatus.MEMBER_ALREADY_EXISTS);
        }

        // Kiểm tra null để tránh NullPointerException
        if (inviter.getName() == null || inviter.getEmail() == null || 
            invitedUser.getId() == null || invitedUser.getName() == null || 
            invitedUser.getEmail() == null || project.getProject_name() == null) {
            log.error("Null values detected: inviter={}, invitedUser={}, project={}", 
                      inviter, invitedUser, project);
            throw new AppException(ErrorStatus.INVALID_INPUT, 
                                  "Required fields (inviter name, email, invited user id, name, email, or project name) cannot be null");
        }

        // Tạo thông báo PENDING
        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setSender(new NotificationRequest.Sender(
            inviter.getId(),
            inviter.getName(),
            inviter.getEmail(),
            inviter.getAvatar_url() != null ? inviter.getAvatar_url() : ""
        ));
        notificationRequest.setReceiver(new NotificationRequest.Receiver(
            invitedUser.getId(),
            invitedUser.getName(),
            invitedUser.getEmail(),
            invitedUser.getAvatar_url() != null ? invitedUser.getAvatar_url() : ""
        ));
        notificationRequest.setProject(new NotificationRequest.Project(
            projectId,
            project.getProject_name()
        ));

        log.info("NotificationRequest created: {}", notificationRequest);
        notificationService.createNotifications(List.of(notificationRequest));
        log.info("Invitation sent to: {} for projectId: {}", request.getEmail(), projectId);
    }

    public List<MembersResponse> getMembersByProject(int projectId, String userId) {
        log.info("Fetching members for projectId: {} by userId: {}", projectId, userId);

        projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        List<Members> members = memberRepository.findByProjectId(String.valueOf(projectId));
        return members.stream()
                .map(membersMapper::toMemberResponse)
                .collect(Collectors.toList());
    }

    public MembersResponse updateMember(int memberId, MemberUpdateRequest request, String userId) {
        log.info("Updating memberId: {} by userId: {}", memberId, userId);

        Members member = memberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ErrorStatus.MEMBER_NOT_FOUND));

        projectRepository.findById(Integer.parseInt(member.getProjectId()))
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        membersMapper.updateMember(member, request);
        Members updatedMember = memberRepository.save(member);
        log.info("Member updated: {}", updatedMember);

        return membersMapper.toMemberResponse(updatedMember);
    }

    public void deleteMember(int memberId, String userId) {
        log.info("Deleting memberId: {} by userId: {}", memberId, userId);

        Members member = memberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ErrorStatus.MEMBER_NOT_FOUND));

        projectRepository.findById(Integer.parseInt(member.getProjectId()))
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        memberRepository.delete(member);
        log.info("Member deleted: {}", memberId);
    }

    public void deleteMemberByEmailAndProject(String email, int projectId, String userId) {
        log.info("Deleting member with email: {} from projectId: {} by userId: {}", email, projectId, userId);

        Members member = memberRepository.findByEmailAndProjectId(email, String.valueOf(projectId))
                .orElseThrow(() -> new AppException(ErrorStatus.MEMBER_NOT_FOUND));

        projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        memberRepository.delete(member);
        log.info("Member deleted: email {} from project {}", email, projectId);
    }

    public void transferLeader(int projectId, String newLeaderEmail, String userId) {
        log.info("Transferring leader for projectId: {} to email: {} by userId: {}", projectId, newLeaderEmail, userId);

        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        if (!project.getCreated_by_id().equals(userId) && 
            !memberRepository.findByEmailAndProjectId(user.getEmail(), String.valueOf(projectId))
                .map(m -> m.getRole().equals("LEADER"))
                .orElse(false)) {
            throw new AppException(ErrorStatus.UNAUTHORIZED);
        }

        Members newLeader = memberRepository.findByEmailAndProjectId(newLeaderEmail, String.valueOf(projectId))
                .orElseThrow(() -> new AppException(ErrorStatus.MEMBER_NOT_FOUND));

        Members currentLeader = memberRepository.findByProjectId(String.valueOf(projectId))
                .stream()
                .filter(m -> m.getRole().equals("LEADER"))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorStatus.MEMBER_NOT_FOUND));

        currentLeader.setRole("USER");
        newLeader.setRole("LEADER");
        project.setLeader(newLeader.getName());

        memberRepository.save(currentLeader);
        memberRepository.save(newLeader);
        projectRepository.save(project);
        log.info("Leadership transferred to: {}", newLeaderEmail);
    }

    public List<MembersResponse> searchUsers(String query, String userId) {
        log.info("Searching users with query: {} by userId: {}", query, userId);

        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getEmail().toLowerCase().contains(query.toLowerCase()) ||
                        user.getName().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());

        return users.stream().map(user -> {
            MembersResponse response = new MembersResponse();
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setAvatarUrl(user.getAvatar_url());
            return response;
        }).collect(Collectors.toList());
    }

    public void addProjectCreatorAsLeader(int projectId, String userId, String userName) {
        log.info("Adding creator as leader for projectId: {} by userId: {}", projectId, userId);

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        Members member = new Members();
        member.setName(creator.getName());
        member.setEmail(creator.getEmail());
        member.setAvatarUrl(creator.getAvatar_url());
        member.setProjectId(String.valueOf(projectId));
        member.setInvitedByName(userName);
        member.setInvitedAt(LocalDate.now().toString());
        member.setRole("LEADER");

        memberRepository.save(member);
        log.info("Creator added as leader for projectId: {}", projectId);
    }

    public MembersResponse acceptInvitation(int notificationId, String userId, String userEmail) {
        log.info("Accepting invitation for notificationId: {} by userId: {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorStatus.NOTIFICATION_NOT_FOUND));

        if (!notification.getRecipient_email().equals(userEmail)) {
            throw new AppException(ErrorStatus.UNAUTHORIZED, "You are not authorized to accept this invitation");
        }

        if (!notification.getInvitationStatus().equals("PENDING")) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Invitation is not in PENDING status");
        }

        int projectId = notification.getProjectId();
        projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        if (memberRepository.existsByEmailAndProjectId(userEmail, String.valueOf(projectId))) {
            throw new AppException(ErrorStatus.MEMBER_ALREADY_EXISTS);
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        Members member = new Members();
        member.setName(user.getName());
        member.setEmail(user.getEmail());
        member.setAvatarUrl(user.getAvatar_url());
        member.setProjectId(String.valueOf(projectId));
        member.setInvitedByName(notification.getUser_name());
        member.setInvitedAt(LocalDate.now().toString());
        member.setRole("USER");

        Members savedMember = memberRepository.save(member);
        notification.setInvitationStatus("ACCEPTED");
        notification.setStatus(NotificationStatus.READ.name());
        notificationRepository.save(notification);

        log.info("Invitation accepted for user: {} in project: {}", userEmail, projectId);
        return membersMapper.toMemberResponse(savedMember);
    }

    public void declineInvitation(int notificationId, String userId, String userEmail) {
        log.info("Declining invitation for notificationId: {} by userId: {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorStatus.NOTIFICATION_NOT_FOUND));

        if (!notification.getRecipient_email().equals(userEmail)) {
            throw new AppException(ErrorStatus.UNAUTHORIZED, "You are not authorized to decline this invitation");
        }

        if (!notification.getInvitationStatus().equals("PENDING")) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Invitation is not in PENDING status");
        }

        notification.setInvitationStatus("DECLINED");
        notification.setStatus(NotificationStatus.READ.name());
        notificationRepository.save(notification);
        log.info("Invitation declined for user: {}", userEmail);
    }
}