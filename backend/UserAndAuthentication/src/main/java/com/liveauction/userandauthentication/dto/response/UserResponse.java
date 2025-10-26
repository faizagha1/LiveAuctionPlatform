package com.liveauction.userandauthentication.dto.response;

import com.liveauction.userandauthentication.entity.RoleEntity;
import com.liveauction.userandauthentication.entity.UserEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        String status,
        List<String> roles,
        BigDecimal auctioneerRating
) {
    public static UserResponse fromEntity(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus().name(),
                user.getRoles().stream()
                        .map(RoleEntity::getName)
                        .toList(),
                user.getAuctioneerRating()
        );
    }
}
