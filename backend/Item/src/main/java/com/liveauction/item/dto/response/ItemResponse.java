package com.liveauction.item.dto.response;

import com.liveauction.item.entity.ItemEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ItemResponse(
    UUID id,
    String name,
    String description,
    String category,
    String condition,
    UUID ownerId,
    String status,
    BigDecimal startingPrice,
    BigDecimal reservePrice,
    BigDecimal bidIncrement,
    Instant createdAt,
    Instant updatedAt
) {
    public static ItemResponse fromEntity(ItemEntity item) {
        return new ItemResponse(
            item.getId(),
            item.getName(),
            item.getDescription(),
            item.getCategory().name(),
            item.getCondition().name(),
            item.getOwnerId(),
            item.getStatus().name(),
            item.getStartingPrice(),
            item.getReservePrice(),
            item.getBidIncrement(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
    }
}