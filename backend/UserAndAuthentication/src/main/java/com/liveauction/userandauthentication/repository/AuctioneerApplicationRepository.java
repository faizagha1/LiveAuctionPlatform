package com.liveauction.userandauthentication.repository;

import com.liveauction.userandauthentication.entity.AuctioneerApplicationEntity;
import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctioneerApplicationRepository extends JpaRepository<AuctioneerApplicationEntity, UUID> {

    // Pessimistic lock for race condition prevention
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AuctioneerApplicationEntity a WHERE a.id = :id")
    Optional<AuctioneerApplicationEntity> findByIdWithLock(@Param("id") UUID id);

    // Check if user already applied
    boolean existsByUserId(UUID userId);

    // Pagination support
    Page<AuctioneerApplicationEntity> findAllByStatus(AuctioneerApplicationStatus status, Pageable pageable);
}
