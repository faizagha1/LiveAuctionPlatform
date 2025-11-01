package com.liveauction.auction.service;

import com.liveauction.auction.dto.request.ClaimItemRequest;
import com.liveauction.auction.dto.request.CreateAuctionRequest;
import com.liveauction.auction.dto.request.ReviewClaimRequest;
import com.liveauction.auction.dto.request.UpdateAuctionRequest;
import com.liveauction.auction.dto.response.*;
import com.liveauction.auction.entity.AuctionEntity;
import com.liveauction.auction.entity.ItemClaimEntity;
import com.liveauction.auction.event.producer.AuctionEventProducer;
import com.liveauction.auction.exceptions.BadRequestException;
import com.liveauction.auction.exceptions.ResourceConflictException;
import com.liveauction.auction.exceptions.ResourceNotFoundException;
import com.liveauction.auction.exceptions.UnauthorizedException;
import com.liveauction.auction.repository.AuctionRepository;
import com.liveauction.auction.repository.ItemClaimRepository;
import com.liveauction.shared.constants.PermissionConstants;
import com.liveauction.shared.events.AuctionEvents.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionService {
    
    private final ItemClaimRepository claimRepository;
    private final AuctionRepository auctionRepository;
    private final SecurityService securityService;
    private final AuctionEventProducer auctionEventProducer;

    private static final long MIN_AUCTION_DURATION_SECONDS = 10800; // 3 hours
    private static final long MIN_CANCEL_DURATION_HOURS = 3; // 3 hours

    @Transactional
    public ClaimResponse claimItem(ClaimItemRequest request, UUID itemId) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} claiming item: {}", currentUserId, itemId);

        if (!securityService.hasPermission(PermissionConstants.CLAIM_ITEM)) {
            log.warn("User {} does not have permission '{}'", currentUserId, PermissionConstants.CLAIM_ITEM);
            throw new UnauthorizedException("User does not have permission to claim items");
        }

        if (claimRepository.existsByItemIdAndAuctioneerId(itemId, currentUserId)) {
            log.warn("User {} has already claimed item {}", currentUserId, itemId);
            throw new ResourceConflictException("You have already claimed this item");
        }

        if (claimRepository.existsByItemIdAndStatus(itemId, ItemClaimEntity.ClaimStatus.APPROVED)) {
            log.warn("Item {} is already claimed by another auctioneer", itemId);
            throw new ResourceConflictException("This item has already been claimed and approved for another auctioneer");
        }

        ItemClaimEntity itemClaim = ItemClaimEntity.builder()
                .itemId(itemId)
                .itemOwnerId(request.itemOwnerId())
                .auctioneerId(currentUserId)
                .auctioneerMessage(request.auctioneerMessage())
                .status(ItemClaimEntity.ClaimStatus.PENDING)
                .build();
        
        itemClaim = claimRepository.save(itemClaim);
        log.info("Claim {} saved successfully for user {}", itemClaim.getId(), currentUserId);
        return ClaimResponse.fromEntity(itemClaim);
    }

    @Transactional
    public ClaimResponse reviewClaim(UUID claimId, ReviewClaimRequest request) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} reviewing claim: {}", currentUserId, claimId);

        ItemClaimEntity claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("ItemClaim", "id", claimId));

        if (!currentUserId.equals(claim.getItemOwnerId())) {
            log.warn("User {} is not the owner of item {}. Review forbidden.", currentUserId, claim.getItemId());
            throw new UnauthorizedException("You are not the owner of this item and cannot review claims.");
        }

        if (claim.getStatus() != ItemClaimEntity.ClaimStatus.PENDING) {
            log.warn("Claim {} is not in PENDING status. Current status: {}", claimId, claim.getStatus());
            throw new ResourceConflictException("This claim has already been reviewed.");
        }

        claim.setSellerMessage(request.sellerMessage());
        claim.setReviewedAt(Instant.now());

        if (request.approve()) {
            log.info("Approving claim {}", claimId);
            claim.setStatus(ItemClaimEntity.ClaimStatus.APPROVED);
            claim = claimRepository.save(claim);

            log.info("Rejecting all other pending claims for item {}", claim.getItemId());
            List<ItemClaimEntity> otherClaims = claimRepository.findByItemIdAndStatus(
                    claim.getItemId(),
                    ItemClaimEntity.ClaimStatus.PENDING
            );
            
            otherClaims.stream()
                .filter(otherClaim -> !otherClaim.getId().equals(claimId))
                .forEach(otherClaim -> {
                    otherClaim.setStatus(ItemClaimEntity.ClaimStatus.REJECTED);
                    otherClaim.setSellerMessage("Another auctioneer's claim was approved.");
                    otherClaim.setReviewedAt(Instant.now());
                    claimRepository.save(otherClaim);
                    log.info("Auto-rejected claim {}", otherClaim.getId());
                });
        } else {
            log.info("Rejecting claim {}", claimId);
            claim.setStatus(ItemClaimEntity.ClaimStatus.REJECTED);
            claim = claimRepository.save(claim);
        }

        return ClaimResponse.fromEntity(claim);
    }

    @Transactional
    public AuctionResponse createAuction(UUID claimId, CreateAuctionRequest request) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} creating auction from claim: {}", currentUserId, claimId);

        if (!securityService.hasPermission(PermissionConstants.CREATE_AUCTION)) {
            log.warn("User {} does not have permission '{}'", currentUserId, PermissionConstants.CREATE_AUCTION);
            throw new UnauthorizedException("User does not have permission to create auctions");
        }
        
        ItemClaimEntity claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("ItemClaim", "id", claimId));

        if (!claim.getAuctioneerId().equals(currentUserId)) {
            log.warn("User {} is not the auctioneer for claim {}. Forbidden.", currentUserId, claimId);
            throw new UnauthorizedException("You are not the auctioneer who made this claim.");
        }
        
        if (claim.getStatus() != ItemClaimEntity.ClaimStatus.APPROVED) {
            log.warn("Claim {} is not in APPROVED status. Current status: {}", claimId, claim.getStatus());
            throw new ResourceConflictException("Auction can only be created from an APPROVED claim.");
        }

        if (Duration.between(request.startTime(), request.endTime()).getSeconds() < MIN_AUCTION_DURATION_SECONDS) {
            log.warn("Invalid auction duration for claim {}", claimId);
            throw new BadRequestException("Auction duration must be at least 3 hours.");
        }

        AuctionEntity auction = AuctionEntity.builder()
                .title(request.title())
                .itemId(claim.getItemId())
                .auctioneerId(currentUserId)
                .claimId(claimId)
                .status(AuctionEntity.AuctionStatus.SCHEDULED)
                .startingPrice(request.startingPrice())
                .reservePrice(request.reservePrice())
                .bidIncrement(request.bidIncrement())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .build();
        
        auction = auctionRepository.save(auction);
        log.info("Auction {} created successfully from claim {}", auction.getId(), claimId);

        // Publish the event
        auctionEventProducer.publishAuctionCreated(
            new AuctionCreatedEvent(
                    auction.getId().toString(),
                    auction.getItemId().toString(),
                    auction.getAuctioneerId().toString(),
                    auction.getStartingPrice().doubleValue(),
                    auction.getReservePrice() != null ? auction.getReservePrice().doubleValue() : 0.0,
                    auction.getBidIncrement().doubleValue(),
                    auction.getStartTime(),
                    auction.getEndTime()
            )
        );

        return AuctionResponse.fromEntity(auction);
    }

    @Transactional
    public AuctionResponse updateAuction(UUID auctionId, UpdateAuctionRequest request) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} updating auction: {}", currentUserId, auctionId);

        AuctionEntity auction = findAuctionByIdOrThrow(auctionId);

        if (!securityService.hasPermission(PermissionConstants.EDIT_AUCTION)) {
             log.warn("User {} does not have permission '{}'", currentUserId, PermissionConstants.EDIT_AUCTION);
            throw new UnauthorizedException("User does not have permission to edit auctions");
        }
        
        if (!auction.getAuctioneerId().equals(currentUserId)) {
            log.warn("User {} is not the auctioneer for auction {}. Forbidden.", currentUserId, auctionId);
            throw new UnauthorizedException("You are not the auctioneer for this auction.");
        }

        if (auction.getStatus() != AuctionEntity.AuctionStatus.SCHEDULED) {
            log.warn("Auction {} is not SCHEDULED. Status: {}", auctionId, auction.getStatus());
            throw new ResourceConflictException("Only SCHEDULED auctions can be updated.");
        }
        
        if (Duration.between(Instant.now(), auction.getStartTime()).toHours() < MIN_CANCEL_DURATION_HOURS) {
            log.warn("Auction {} starts within 3 hours and cannot be edited", auctionId);
            throw new ResourceConflictException("Auctions starting within 3 hours cannot be edited.");
        }
        
        if (Duration.between(request.startTime(), request.endTime()).getSeconds() < MIN_AUCTION_DURATION_SECONDS) {
            log.warn("Invalid new auction duration for auction {}", auctionId);
            throw new BadRequestException("Auction duration must be at least 3 hours.");
        }
        
        auction.setTitle(request.title());
        auction.setStartTime(request.startTime());
        auction.setEndTime(request.endTime());
        
        auction = auctionRepository.save(auction);
        log.info("Auction {} updated successfully", auctionId);
        return AuctionResponse.fromEntity(auction);
    }

    @Transactional
    public AuctionResponse cancelAuction(UUID auctionId) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} cancelling auction: {}", currentUserId, auctionId);

        AuctionEntity auction = findAuctionByIdOrThrow(auctionId);

        if (!securityService.hasPermission(PermissionConstants.CANCEL_AUCTION)) {
            log.warn("User {} does not have permission '{}'", currentUserId, PermissionConstants.CANCEL_AUCTION);
            throw new UnauthorizedException("User does not have permission to cancel auctions");
        }

        if (!auction.getAuctioneerId().equals(currentUserId)) {
            log.warn("User {} is not the auctioneer for auction {}. Forbidden.", currentUserId, auctionId);
            throw new UnauthorizedException("You are not the auctioneer for this auction.");
        }

        if (auction.getStatus() != AuctionEntity.AuctionStatus.SCHEDULED) {
            log.warn("Auction {} is not SCHEDULED. Status: {}", auctionId, auction.getStatus());
            throw new ResourceConflictException("Only SCHEDULED auctions can be cancelled.");
        }

        if (Duration.between(Instant.now(), auction.getStartTime()).toHours() < MIN_CANCEL_DURATION_HOURS) {
            log.warn("Auction {} starts within 3 hours and cannot be cancelled", auctionId);
            throw new ResourceConflictException("Cannot cancel auctions starting within 3 hours.");
        }

        log.info("Canceling auction: {}", auctionId);
        auction.setStatus(AuctionEntity.AuctionStatus.CANCELLED);
        
        // Re-open the claim for other auctioneers by deleting the approved claim
        claimRepository.deleteById(auction.getClaimId());
        log.info("Associated claim {} deleted, item is available again.", auction.getClaimId());

        auction = auctionRepository.save(auction);
        
        // TODO: Publish an AuctionCancelledEvent
        
        return AuctionResponse.fromEntity(auction);
    }

    @Transactional(readOnly = true)
    public Page<AuctionResponsePartial> listMyAuctions(Pageable pageable) {
        UUID userId = securityService.getCurrentUserId();
        log.info("Fetching auctions for auctioneer: {}", userId);
        Page<AuctionEntity> myAuctions = auctionRepository.findAllByAuctioneerId(userId, pageable);
        return myAuctions.map(AuctionResponsePartial::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public AuctionResponse getAuctionDetails(UUID auctionId) {
        UUID currentUserId = securityService.getCurrentUserId();
        AuctionEntity auction = findAuctionByIdOrThrow(auctionId);
        
        if (!auction.getAuctioneerId().equals(currentUserId)) {
            log.warn("User {} is not the auctioneer for auction {}. Forbidden.", currentUserId, auctionId);
            throw new UnauthorizedException("You are not the auctioneer for this auction.");
        }
        return AuctionResponse.fromEntity(auction);
    }

    @Transactional(readOnly = true)
    public AuctionResponsePublic getPublicAuctionDetails(UUID auctionId) {
        AuctionEntity auction = findAuctionByIdOrThrow(auctionId);
        return AuctionResponsePublic.fromEntity(auction);
    }

    @Transactional(readOnly = true)
    public Page<AuctionResponsePublic> listAuctionsByStatus(AuctionEntity.AuctionStatus status, Pageable pageable) {
        Page<AuctionEntity> auctions = auctionRepository.findAllByStatus(status, pageable);
        return auctions.map(AuctionResponsePublic::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> listAllClaims(UUID itemId) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} listing all claims for item: {}", currentUserId, itemId);
        
        // Find one claim to verify ownership. This is more efficient than loading all.
        ItemClaimEntity claimCheck = claimRepository.findByItemIdAndStatus(itemId, ItemClaimEntity.ClaimStatus.PENDING)
            .stream().findFirst().orElse(null);
        
        if (claimCheck != null && !claimCheck.getItemOwnerId().equals(currentUserId)) {
             log.warn("User {} is not the owner of item {}. Forbidden.", currentUserId, itemId);
             throw new UnauthorizedException("You are not the owner of this item.");
        }
        
        // If the check passed (or no pending claims exist), return the list.
        List<ItemClaimEntity> claims = (claimCheck == null) 
            ? List.of() 
            : claimRepository.findByItemIdAndStatus(itemId, ItemClaimEntity.ClaimStatus.PENDING);
            
        return claims.stream()
                .map(ClaimResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ClaimResponse> listAllClaimsOfUser(Pageable pageable) {
        UUID userId = securityService.getCurrentUserId();
        log.info("User {} listing their approved claims", userId);
        Page<ItemClaimEntity> userClaims = claimRepository
                .findAllByAuctioneerIdAndStatus(userId, ItemClaimEntity.ClaimStatus.APPROVED, pageable);
        return userClaims.map(ClaimResponse::fromEntity);
    }
    
    private AuctionEntity findAuctionByIdOrThrow(UUID auctionId) {
        return auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction", "id", auctionId));
    }
}