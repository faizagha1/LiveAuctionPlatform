package com.liveauction.item.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemEntity extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemCondition condition;

    @Column(nullable = false, updatable = false) // Owner should not change
    private UUID ownerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal startingPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal reservePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal bidIncrement;

    // Enums
    public enum ItemStatus {
        DRAFT,              // Created but not submitted
        PENDING_APPROVAL,   // Submitted for admin review
        APPROVED,           // Admin approved, can be claimed
        REJECTED,           // Admin rejected
        CANCELLED           // Owner cancelled (only from DRAFT or REJECTED)
    }

    public enum ItemCategory {
        COLLECTIBLES,
        ART,
        JEWELRY,
        ELECTRONICS,
        AUTOMOTIVE,
        SPORTS,
        INSTRUMENTS,
        ANTIQUES,
        OTHER
    }

    public enum ItemCondition {
        NEW,
        LIKE_NEW,
        EXCELLENT,
        GOOD,
        FAIR,
        POOR
    }
}