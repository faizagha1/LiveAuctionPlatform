package com.liveauction.auction.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "item_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemClaimEntity extends BaseEntity {
    
    @Column(nullable = false)
    private UUID itemId; // Item being claimed
    
    @Column(nullable = false)
    private UUID itemOwnerId; // Seller who owns the item
    
    @Column(nullable = false)
    private UUID auctioneerId; // Auctioneer who wants to auction it
    
    @Column(columnDefinition = "TEXT")
    private String auctioneerMessage; // Why they want to auction it
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ClaimStatus status = ClaimStatus.PENDING;
    
    private String sellerMessage; // Seller's response (approval/rejection reason)
    
    private Instant reviewedAt; // When seller reviewed the claim
    
    // Claim Status Enum
    public enum ClaimStatus {
        PENDING,   // Waiting for seller review
        APPROVED,  // Seller approved, can create auction
        REJECTED   // Seller rejected
    }
}