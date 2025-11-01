package com.liveauction.auction.repository;

import com.liveauction.auction.entity.ItemClaimEntity;
import com.liveauction.auction.entity.ItemClaimEntity.ClaimStatus;
import jakarta.persistence.LockModeType;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemClaimRepository extends JpaRepository<ItemClaimEntity, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM ItemClaimEntity c WHERE c.id = :id")
    Optional<ItemClaimEntity> findById(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<ItemClaimEntity> findByItemIdAndStatus(UUID itemId, ClaimStatus claimStatus);

    boolean existsByItemIdAndAuctioneerId(@NotNull(message = "Item ID is required") UUID uuid, UUID currentUserId);

    Page<ItemClaimEntity> findAllByAuctioneerIdAndStatus(UUID auctioneerId, ItemClaimEntity.ClaimStatus status, Pageable pageable);

    boolean existsByItemIdAndStatus(@NotNull(message = "Item ID is required") UUID uuid, ClaimStatus claimStatus);
}
