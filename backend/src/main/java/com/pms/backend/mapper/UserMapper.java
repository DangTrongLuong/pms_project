package com.pms.backend.mapper;

import com.pms.backend.dto.request.UserCreationRequest;
import com.pms.backend.dto.request.UserUpdateRequest;
import com.pms.backend.dto.response.UserResponse;
import com.pms.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);
    UserResponse toUserResponse(User user);
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
