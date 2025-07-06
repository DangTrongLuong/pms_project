package com.pms.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pms.backend.dto.request.MemberCreationRequest;
import com.pms.backend.dto.request.MemberUpdateRequest;
import com.pms.backend.dto.response.MembersResponse;
import com.pms.backend.entity.Members;
import com.pms.backend.entity.User;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.MembersMapper;
import com.pms.backend.repository.MemberRepository;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.UserRepository;

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


    public MembersResponse addMember(int projectId, MemberCreationRequest request, String userId) {
        log.info("Adding member to projectId: {} by userId: {}", projectId, userId);

        // Validate project existence
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        // Validate user existence
        User invitedUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        // Check if user is already a member
        if (memberRepository.existsByEmailAndProjectId(request.getEmail(), String.valueOf(projectId))) {
            throw new AppException(ErrorStatus.MEMBER_ALREADY_EXISTS);
        }

        // Get inviter's details
        User inviter = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));

        Members member = membersMapper.toMember(request);
        member.setName(invitedUser.getName());
        member.setEmail(invitedUser.getEmail());
        member.setAvatarUrl(invitedUser.getAvatar_url());
        member.setProjectId(String.valueOf(projectId));
        member.setInvitedByName(inviter.getName());
        member.setInvitedAt(LocalDate.now().toString());
        member.setRole("USER");

        Members savedMember = memberRepository.save(member);
        log.info("Member added: {}", savedMember);

        return membersMapper.toMemberResponse(savedMember);
    }

    public List<MembersResponse> getMembersByProject(int projectId, String userId) {
        log.info("Fetching members for projectId: {} by userId: {}", projectId, userId);

        // Validate project access
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

        // Validate project access
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

        // Validate project access
        projectRepository.findById(Integer.parseInt(member.getProjectId()))
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));

        memberRepository.delete(member);
        log.info("Member deleted: {}", memberId);
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
}