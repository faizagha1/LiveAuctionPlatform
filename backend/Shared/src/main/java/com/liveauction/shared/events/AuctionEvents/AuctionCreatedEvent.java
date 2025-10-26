package com.liveauction.shared.events.AuctionEvents;

import java.time.Instant;

public record AuctionCreatedEvent(
        String auctionId,
        String itemId,
        String auctioneerId,
        Double startingBid,
        Double reserveBid,
        Double bidIncrement,
        Instant startTime,
        Instant endTime
) {
}
