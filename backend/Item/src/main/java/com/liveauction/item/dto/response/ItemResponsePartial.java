package com.liveauction.item.dto.response;

import com.liveauction.item.entity.ItemEntity;

import java.math.BigDecimal;
import java.util.UUID;

public record ItemResponsePartial(
    UUID id,
    String name,
    String category,
    String condition,
    String status,
    BigDecimal startingPrice
) {
    public static ItemResponsePartial fromEntity(ItemEntity item) {
        return new ItemResponsePartial(
            item.getId(),
            item.getName(),
            item.getCategory().name(),
            item.getCondition().name(),
            item.getStatus().name(),
            item.getStartingPrice()
        );
    }
}