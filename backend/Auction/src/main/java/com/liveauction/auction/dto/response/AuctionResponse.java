package com.liveauction.auction.dto.response;

import com.liveauction.auction.entity.AuctionEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AuctionResponse(
    UUID auctionId,
    String title,
    UUID itemId,
    UUID auctioneerId,
    String status,
    BigDecimal startingPrice,
    BigDecimal reservePrice,
    BigDecimal bidIncrement,
    Instant startTime,
    Instant endTime,
    UUID winnerId,
    BigDecimal winningBid,
    Instant createdAt
) {
    public static AuctionResponse fromEntity(AuctionEntity auction) {
        return new AuctionResponse(
            auction.getId(),
            auction.getTitle(),
            auction.getItemId(),
            auction.getAuctioneerId(),
            auction.getStatus().name(),
            auction.getStartingPrice(),
            auction.getReservePrice(),
            auction.getBidIncrement(),
            auction.getStartTime(),
            auction.getEndTime(),
            auction.getWinnerId(),
            auction.getWinningBid(),
            auction.getCreatedAt()
        );
    }
}