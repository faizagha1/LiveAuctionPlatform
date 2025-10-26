package com.liveauction.auction.repository;

import com.liveauction.auction.entity.AuctionEntity;
import com.liveauction.auction.entity.AuctionEntity.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctionRepository extends JpaRepository<AuctionEntity, UUID> {
    
    // Find auctions by auctioneer
    Optional<List<AuctionEntity>> findAllByAuctioneerId(UUID auctioneerId);
    
    // Find auctions by status (for public listing)
    Optional<List<AuctionEntity>> findAllByStatus(AuctionStatus status);
    
    // Find SCHEDULED auctions that should start (for scheduled task)
    List<AuctionEntity> findAllByStatusAndStartTimeLessThanEqual(AuctionStatus status, Instant time);
    
    // Find ONGOING auctions that should end (for scheduled task)
    List<AuctionEntity> findAllByStatusAndEndTimeLessThanEqual(AuctionStatus status, Instant time);
}
