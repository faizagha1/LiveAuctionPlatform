package com.liveauction.auction.repository;

import com.liveauction.auction.entity.AuctionEntity;
import com.liveauction.auction.entity.AuctionEntity.AuctionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctionRepository extends JpaRepository<AuctionEntity, UUID> {

    Optional<List<AuctionEntity>> findAllByAuctioneerId(UUID auctioneerId);
    Optional<List<AuctionEntity>> findAllByStatus(AuctionEntity.AuctionStatus status);

    Page<AuctionEntity> findAllByAuctioneerId(UUID auctioneerId, Pageable pageable);
    Page<AuctionEntity> findAllByStatus(AuctionEntity.AuctionStatus status, Pageable pageable);

    List<AuctionEntity> findAllByStatusAndStartTimeLessThanEqual(AuctionStatus auctionStatus, Instant now);

    List<AuctionEntity> findAllByStatusAndEndTimeLessThanEqual(AuctionStatus auctionStatus, Instant now);
}