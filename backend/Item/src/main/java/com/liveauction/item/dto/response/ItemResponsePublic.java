package com.liveauction.item.dto.response;

import com.liveauction.item.entity.ItemEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ItemResponsePublic(
    UUID itemId,
    UUID itemOwnerId,
    String name,
    String description,
    String category,
    String condition,
    BigDecimal startingPrice,
    BigDecimal reservePrice,
    BigDecimal bidIncrement,
    Instant createdAt
) {
    public static ItemResponsePublic fromEntity(ItemEntity item) {
        return new ItemResponsePublic(
            item.getId(),
            item.getOwnerId(),
            item.getName(),
            item.getDescription(),
            item.getCategory().name(),
            item.getCondition().name(),
            item.getStartingPrice(),
            item.getReservePrice(),
            item.getBidIncrement(),
            item.getCreatedAt()
        );
    }
}