package com.pms.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.pms.backend.dto.MessageDTO;
import com.pms.backend.entity.ChatMessage;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    @Mapping(target = "timestamp", ignore = true)
    ChatMessage toEntity(MessageDTO dto);

    MessageDTO toDTO(ChatMessage entity);
}