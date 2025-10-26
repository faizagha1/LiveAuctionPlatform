package com.liveauction.auction.dto.response;

import com.liveauction.auction.entity.AuctionEntity;

import java.time.Instant;
import java.util.UUID;

public record AuctionResponsePartial(
    UUID auctionId,
    String title,
    String status,
    Instant startTime,
    Instant endTime
) {
    public static AuctionResponsePartial fromEntity(AuctionEntity auction) {
        return new AuctionResponsePartial(
            auction.getId(),
            auction.getTitle(),
            auction.getStatus().name(),
            auction.getStartTime(),
            auction.getEndTime()
        );
    }
}