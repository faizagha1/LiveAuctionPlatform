package com.liveauction.item.dto.response;

import com.liveauction.item.entity.ItemEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ItemResponseAuctioneer(
        UUID id,
        String name,
        String description,
        String category,
        String condition,
        String status,
        BigDecimal startingPrice,
        BigDecimal reservePrice,
        BigDecimal bidIncrement
) {
    public static ItemResponseAuctioneer toResponse(ItemEntity item){
        return new ItemResponseAuctioneer(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getCategory().name(),
                item.getCondition().name(),
                item.getStatus().name(),
                item.getStartingPrice(),
                item.getReservePrice(),
                item.getBidIncrement()
        );
    }
}
