package com.liveauction.userandauthentication.dto.response;

import com.liveauction.userandauthentication.entity.AuctioneerApplicationEntity;
import com.liveauction.userandauthentication.entity.UserEntity;
import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record AuctioneerApplication(
        UUID id,
        UUID userId,
        String username,
        String email,
        AuctioneerApplicationStatus status,
        Instant appliedAt,
        Instant userRegisteredAt,
        String applicationReason
) {
    public static AuctioneerApplication fromEntity(AuctioneerApplicationEntity entity,
                                                   UserEntity user) {
        return new AuctioneerApplication(
                entity.getId(),
                entity.getUserId(),
                user.getRealUsername(),
                user.getEmail(),
                entity.getStatus(),
                entity.getCreatedAt(),
                user.getCreatedAt(),
                entity.getReason()
        );
    }
}
