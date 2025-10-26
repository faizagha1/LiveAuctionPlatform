package com.liveauction.auction.dto.response;

import com.liveauction.auction.entity.AuctionEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AuctionResponsePublic(
    UUID auctionId,
    String title,
    UUID itemId,
    String status,
    BigDecimal startingPrice,
    BigDecimal bidIncrement,
    Instant startTime,
    Instant endTime
) {
    public static AuctionResponsePublic fromEntity(AuctionEntity auction) {
        return new AuctionResponsePublic(
            auction.getId(),
            auction.getTitle(),
            auction.getItemId(),
            auction.getStatus().name(),
            auction.getStartingPrice(),
            auction.getBidIncrement(),
            auction.getStartTime(),
            auction.getEndTime()
        );
    }
}