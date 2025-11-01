package com.liveauction.userandauthentication.dto.response;

import com.liveauction.userandauthentication.entity.AuctioneerApplicationEntity;
import com.liveauction.userandauthentication.entity.UserEntity;
import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record AuctioneerApplicationLimited(
        UUID id,
        String username,
        String email,
        AuctioneerApplicationStatus status,
        Instant appliedAt
) {
    public static AuctioneerApplicationLimited fromEntity(
            AuctioneerApplicationEntity entity,
            UserEntity user
    ) {
        return new AuctioneerApplicationLimited(
                entity.getId(),
                user.getRealUsername(),
                user.getEmail(),
                entity.getStatus(),
                entity.getCreatedAt()
        );
    }
}