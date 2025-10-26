package com.liveauction.auction.service;

import com.liveauction.auction.dto.request.ClaimItemRequest;
import com.liveauction.auction.dto.request.CreateAuctionRequest;
import com.liveauction.auction.dto.request.ReviewClaimRequest;
import com.liveauction.auction.dto.request.UpdateAuctionRequest;
import com.liveauction.auction.dto.response.*;
import com.liveauction.auction.entity.AuctionEntity;
import com.liveauction.auction.entity.ItemClaimEntity;
import com.liveauction.auction.repository.AuctionRepository;
import com.liveauction.auction.repository.ItemClaimRepository;
import com.liveauction.shared.constants.PermissionConstants;
import com.liveauction.shared.constants.RoleConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionService {
    
    private final ItemClaimRepository claimRepository;
    private final AuctionRepository auctionRepository;

    /**
     * Auctioneer claims an item
     * - Verify user has ROLE_AUCTIONEER
     * - Create ItemClaimEntity with status PENDING
     * - Save and return
     */
    @Transactional
    public ClaimResponse claimItem(ClaimItemRequest request) {
        log.info("Claiming item: {}", request.itemId());
        log.info("Item owner: {}", request.itemOwnerId());
        log.info("Checking if a claim on this item by the same user already exists");
        if(claimRepository.existsByItemIdAndAuctioneerId(
                request.itemId(),
                getCurrentUserId()
        )){
            log.error("A claim on this item by the same user already exists");
            throw new RuntimeException("You have already claimed this item");
        }

        if(claimRepository.existsByItemIdAndStatus(request.itemId(), ItemClaimEntity.ClaimStatus.APPROVED)){
            throw new RuntimeException("This item is already claimed");
        }

        log.info("Checking if current user is an auctioneer and rejecting request if they are not");
        String permissionToClaimItem = PermissionConstants.CLAIM_ITEM;
        if(!getCurrentUserRoles().contains(permissionToClaimItem)){
            log.error("Current user is not an auctioneer");
            throw new RuntimeException("User does not have auctioneer role");
        }
        log.info("By auctioneer: {}", getCurrentUserId());
        UUID userId = getCurrentUserId();
        log.info("Creating ItemClaimEntity with PENDING status");
        ItemClaimEntity itemClaim = ItemClaimEntity
                .builder()
                .itemId(request.itemId())
                .itemOwnerId(request.itemOwnerId())
                .auctioneerId(userId)
                .auctioneerMessage(request.auctioneerMessage())
                .status(ItemClaimEntity.ClaimStatus.PENDING)
                .build();
        log.info("Saving claim to repository");
        itemClaim = claimRepository.save(itemClaim);
        log.info("Returning ClaimResponse");
        return ClaimResponse.fromEntity(itemClaim);
    }

    /**
     * Seller reviews a claim (approve/reject)
     * - Verify claim exists
     * - Verify current user is the item owner
     * - Verify claim status is PENDING
     * - If approved: set this claim to APPROVED, reject all other pending claims for same item
     * - If rejected: set this claim to REJECTED
     * - Save and return
     */
    @Transactional
    public ClaimResponse reviewClaim(UUID claimId, ReviewClaimRequest request) {
        log.info("Reviewing claim: {}", claimId);
        log.info("Checking to see if claim exists");
        ItemClaimEntity claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        log.info("Verifying current user is the item owner");
        if(!getCurrentUserId().equals(claim.getItemOwnerId())){
            log.error("Current user is not the item owner");
            throw new RuntimeException("User is not the item owner");
        }
        log.info("Verifying claim status is PENDING");
        if(claim.getStatus() != ItemClaimEntity.ClaimStatus.PENDING){
            log.error("Claim status is not PENDING");
            throw new RuntimeException("Claim is not in PENDING status");
        }
        if(request.approve()){
            log.info("Approving claim");
            claim.setStatus(ItemClaimEntity.ClaimStatus.APPROVED);
            claim.setSellerMessage(request.sellerMessage());
            log.info("Rejecting all other pending claims for the same item");
            List<ItemClaimEntity> otherClaims = claimRepository.findByItemIdAndStatus(
                    claim.getItemId(),
                    ItemClaimEntity.ClaimStatus.PENDING
            );
            for(ItemClaimEntity otherClaim : otherClaims){
                if(!otherClaim.getId().equals(claimId)){
                    otherClaim.setStatus(ItemClaimEntity.ClaimStatus.REJECTED);
                    otherClaim.setSellerMessage("Another auctioneer's claim was approved");
                    otherClaim.setReviewedAt(Instant.now());
                    claimRepository.save(otherClaim);
                }
            }
        } else {
            log.info("Rejecting claim");
            claim.setStatus(ItemClaimEntity.ClaimStatus.REJECTED);
            claim.setSellerMessage(request.sellerMessage());
        }
        claim.setReviewedAt(Instant.now());
        log.info("Saving reviewed claim to repository");
        claim =  claimRepository.save(claim);
        log.info("Returning ClaimResponse");
        return ClaimResponse.fromEntity(claim);
    }

    /**
     * Create auction from approved claim
     * - Verify claim exists and is APPROVED
     * - Verify current user is the auctioneer who made the claim
     * - Verify endTime > startTime
     * - Create AuctionEntity with status SCHEDULED
     * - Save and return
     * - TODO: Publish ResourceCreatedEvent for Auth Service
     */
    @Transactional
    public AuctionResponse createAuction(UUID claimId, CreateAuctionRequest request) {
        log.info("Creating auction from claim: {}", claimId);
        log.info("Checking if current user has role auctioneer");
        String createAuctionPermission = PermissionConstants.CREATE_AUCTION;
        if(!getCurrentUserRoles().contains(createAuctionPermission)){
            log.error("Current user does not have auctioneer role");
            throw new RuntimeException("User does not have auctioneer role");
        }
        log.info("Checking if the current user is the auction owner");
        UUID userId = getCurrentUserId();
        log.info("Finding claim by ID");
        ItemClaimEntity claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        if(!claim.getAuctioneerId().equals(userId)){
            log.error("Current user is not the auctioneer who made the claim");
            throw new RuntimeException("User is not the auctioneer who made the claim");
        }
        log.info("Verifying claim is APPROVED");
        if(claim.getStatus() != ItemClaimEntity.ClaimStatus.APPROVED){
            log.error("Claim is not APPROVED");
            throw new RuntimeException("Claim is not APPROVED");
        }
        log.info("Validating endTime is after startTime");
        if(Duration.between(request.startTime() , request.endTime()).getSeconds() < 10800){
            log.error("endTime must be at least 3 hours after startTime");
            throw new RuntimeException("Every auction must be at least 3 hours long");
        }
        log.info("Creating AuctionEntity with SCHEDULED status");
        AuctionEntity auction = AuctionEntity
                .builder()
                .title(request.title())
                .itemId(claim.getItemId())
                .auctioneerId(userId)
                .claimId(claimId)
                .startingPrice(request.startingPrice())
                .reservePrice(request.reservePrice())
                .bidIncrement(request.bidIncrement())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .build();
        log.info("Saving auction to repository");
        auction = auctionRepository.save(auction);
        log.info("Returning AuctionResponse");
        return AuctionResponse.fromEntity(auction);
    }

    /**
     * Update auction (only SCHEDULED auctions)
     * - Verify auction exists
     * - Verify current user is the auctioneer
     * - Verify status is SCHEDULED
     * - Update title, startTime, endTime
     * - Save and return
     */
    @Transactional
    public AuctionResponse updateAuction(UUID auctionId, UpdateAuctionRequest request) {
        log.info("Updating auction: {}", auctionId);
        AuctionEntity auction = auctionRepository
                .findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if(!getCurrentUserRoles().contains(PermissionConstants.EDIT_AUCTION)){
            log.error("Current user does not have permission to edit auctions");
            throw new RuntimeException("User does not have permission to edit auctions");
        }
        log.info("Verifying its a scheduled auction that can be updated");
        if(!auction.getStatus().equals(AuctionEntity.AuctionStatus.SCHEDULED)){
            log.error("Auction status is not SCHEDULED");
            throw new RuntimeException("Only SCHEDULED auctions can be updated");
        }
        log.info("Verifying if auction starts within the next 3 hours and if so, it cannot be edited");
        if(Duration.between(Instant.now() , auction.getStartTime()).toHours() < 3){
            log.error("Auction starts within the next 3 hours and cannot be edited");
            throw new RuntimeException("Auctions starting within 3 hours cannot be edited");
        }
        log.info("Verifying current user is the auctioneer");
        if(!getCurrentUserId().equals(auction.getAuctioneerId())){
            log.error("Current user is not the auctioneer");
            throw new RuntimeException("User is not the auctioneer");
        }
        log.info("Checking if the new start time and new end times still have a 3 hour gap");
        if(Duration.between(request.startTime() , request.endTime()).toSeconds() < 10800){
            log.info("endTime must be at least 3 hours after startTime");
            throw new RuntimeException("Every auction must be at least 3 hours long");
        }
        log.info("All security measures take, proceeding to update auction details");
        auction.setTitle(request.title());
        auction.setStartTime(request.startTime());
        auction.setEndTime(request.endTime());
        log.info("Saving updated auction to repository");
        auction = auctionRepository.save(auction);
        log.info("Returning AuctionResponse");
        return AuctionResponse.fromEntity(auction);
    }

    /**
     * Cancel auction (only SCHEDULED, >1 hour before start)
     * - Verify auction exists
     * - Verify current user is the auctioneer
     * - Verify status is SCHEDULED
     * - Verify startTime is >1 hour away
     * - Set status to CANCELLED
     * - Save and return
     */
    @Transactional
    public AuctionResponse cancelAuction(UUID auctionId) {
        log.info("Cancelling auction: {}", auctionId);
        AuctionEntity auction = auctionRepository
                .findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if(!getCurrentUserRoles().contains(PermissionConstants.CANCEL_AUCTION)){
            log.error("Current user does not have permission to cancel auctions");
            throw new RuntimeException("User does not have permission to cancel auctions");
        }

        if(!auction.getAuctioneerId().equals(getCurrentUserId())){
            log.error("Current user is not the auctioneer");
            throw new RuntimeException("User is not the auctioneer");
        }

        if(!auction.getStatus().equals(AuctionEntity.AuctionStatus.SCHEDULED)){
            throw new RuntimeException("Only SCHEDULED auctions can be cancelled");
        }

        if(Duration.between(Instant.now(), auction.getStartTime()).toHours() < 3){
            throw new RuntimeException("Cannot cancel auctions starting within 3 hours");
        }

        log.info("Canceling auction: {}", auctionId);
        auction.setStatus(AuctionEntity.AuctionStatus.CANCELLED);
        claimRepository.deleteById(auction.getClaimId());

        auction = auctionRepository.save(auction);
        return AuctionResponse.fromEntity(auction);
    }

    /**
     * List auctions by current auctioneer
     */
    public List<AuctionResponsePartial> listMyAuctions() {
        if(!getCurrentUserRoles().contains(PermissionConstants.VIEW_AUCTION)){
            log.error("Current user does not have permission to view auctions");
            throw new RuntimeException("User does not have permission to view auctions");
        }
        UUID userId = getCurrentUserId();
        List<AuctionEntity> myAuctions = auctionRepository.findAllByAuctioneerId(userId)
                .orElse(new ArrayList<>());
        return myAuctions.stream()
                .map(AuctionResponsePartial::fromEntity)
                .toList();
    }

    /**
     * Get auction details (auctioneer only)
     */
    public AuctionResponse getAuctionDetails(UUID auctionId) {
        AuctionEntity auction = auctionRepository
                .findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if(!auction.getAuctioneerId().equals(getCurrentUserId())){
            log.error("Current user is not the auctioneer");
            throw new RuntimeException("User is not the auctioneer");
        }
        return AuctionResponse.fromEntity(auction);
    }

    /**
     * Get public auction details (anyone)
     */
    public AuctionResponsePublic getPublicAuctionDetails(UUID auctionId) {
        AuctionEntity auction = auctionRepository
                .findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        return AuctionResponsePublic.fromEntity(auction);
    }

    /**
     * List auctions by status (public - for browsing)
     */
    public List<AuctionResponsePublic> listAuctionsByStatus(AuctionEntity.AuctionStatus status) {
        List<AuctionEntity> auctions = auctionRepository.findAllByStatus(status)
                .orElse(new ArrayList<>());
        return auctions.stream()
                .map(AuctionResponsePublic::fromEntity)
                .toList();
    }

    public List<ClaimResponse> listAllClaims(UUID itemId) {
        List<ItemClaimEntity> claims = claimRepository.findByItemIdAndStatus(
                itemId,
                ItemClaimEntity.ClaimStatus.PENDING
        );
        return claims.stream()
                .map(ClaimResponse::fromEntity)
                .toList();
    }

    public List<ClaimResponse> listAllClaimsOfUser() {
        UUID userId = getCurrentUserId();
        List<ItemClaimEntity> userClaims = claimRepository
                .findAllByAuctioneerIdAndStatus(userId, ItemClaimEntity.ClaimStatus.APPROVED)
                .orElse(new ArrayList<>());
        return userClaims.stream()
                .map(ClaimResponse::fromEntity)
                .toList();
    }

    // Helper methods
    private UUID getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }
        throw new RuntimeException("No authenticated user found");
    }

    private List<String> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }

    private boolean hasRole(String role) {
        return getCurrentUserRoles().contains(role);
    }
}