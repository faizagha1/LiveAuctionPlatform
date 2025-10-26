package com.liveauction.auction.repository;

import com.liveauction.auction.entity.ItemClaimEntity;
import com.liveauction.auction.entity.ItemClaimEntity.ClaimStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemClaimRepository extends JpaRepository<ItemClaimEntity, UUID> {

    // Find all claims for a specific item
    Optional<List<ItemClaimEntity>> findAllByItemId(UUID itemId);

    // Find all pending claims for an item (for auto-rejection after approval)
    Optional<List<ItemClaimEntity>> findAllByItemIdAndStatus(UUID itemId, ClaimStatus status);

    // Find claims by auctioneer
    Optional<List<ItemClaimEntity>> findAllByAuctioneerId(UUID auctioneerId);

    List<ItemClaimEntity> findByItemIdAndStatus(UUID itemId, ClaimStatus claimStatus);

    boolean existsByItemIdAndAuctioneerId(@NotNull(message = "Item ID is required") UUID uuid, UUID currentUserId);

    Optional<List<ItemClaimEntity>> findAllByAuctioneerIdAndStatus(UUID userId, ClaimStatus status);

    boolean existsByItemIdAndStatus(@NotNull(message = "Item ID is required") UUID uuid, ClaimStatus claimStatus);
}
