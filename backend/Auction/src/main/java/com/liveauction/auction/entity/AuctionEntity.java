package com.liveauction.auction.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auctions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionEntity extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false)
    private UUID itemId; // Item being auctioned
    
    @Column(nullable = false)
    private UUID auctioneerId; // Who's conducting the auction

    @Column(nullable = false)
    private UUID claimId; // Reference to ItemClaimEntity
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuctionStatus status = AuctionStatus.SCHEDULED;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal startingPrice;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal reservePrice;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal bidIncrement;
    
    @Column(nullable = false)
    private Instant startTime; // When auction starts
    
    @Column(nullable = false)
    private Instant endTime; // When auction ends
    
    private UUID winnerId; // Highest bidder (set by bidding engine)
    
    @Column(precision = 10, scale = 2)
    private BigDecimal winningBid; // Final winning bid amount
    
    // Auction Status Enum
    public enum AuctionStatus {
        SCHEDULED,  // Created, waiting for startTime
        ONGOING,    // Currently accepting bids
        COMPLETED,  // Ended, winner determined
        CANCELLED   // Cancelled by auctioneer
    }
}