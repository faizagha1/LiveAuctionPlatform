package com.liveauction.auction.dto.response;

import com.liveauction.auction.entity.ItemClaimEntity;

import java.time.Instant;
import java.util.UUID;

public record ClaimResponse(
        UUID claimId,
        UUID itemId,
        UUID itemOwnerId,
        UUID auctioneerId,
        String auctioneerMessage,
        String status,
        String sellerMessage,
        Instant reviewedAt,
        Instant createdAt
) {
    public static ClaimResponse fromEntity(ItemClaimEntity claim) {
        return new ClaimResponse(
                claim.getId(),
                claim.getItemId(),
                claim.getItemOwnerId(),
                claim.getAuctioneerId(),
                claim.getAuctioneerMessage(),
                claim.getStatus().name(),
                claim.getSellerMessage(),
                claim.getReviewedAt(),
                claim.getCreatedAt()
        );
    }
}
