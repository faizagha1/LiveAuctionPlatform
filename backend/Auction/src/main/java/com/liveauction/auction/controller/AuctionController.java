package com.liveauction.auction.controller;

import com.liveauction.auction.dto.request.ClaimItemRequest;
import com.liveauction.auction.dto.request.CreateAuctionRequest;
import com.liveauction.auction.dto.request.ReviewClaimRequest;
import com.liveauction.auction.dto.request.UpdateAuctionRequest;
import com.liveauction.auction.dto.response.*;
import com.liveauction.auction.entity.AuctionEntity;
import com.liveauction.auction.service.AuctionService;
import com.liveauction.shared.constants.PermissionConstants;
import com.liveauction.shared.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v2/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    @PostMapping("/{itemId}/claim")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CLAIM_ITEM + "')")
    public ResponseEntity<ApiResponse<ClaimResponse>> claimItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody ClaimItemRequest request
    ) {
        log.info("Request received to claim item: {}", itemId);
        ClaimResponse response = auctionService.claimItem(request, itemId);
        return new ResponseEntity<>(ApiResponse.success("Item claim submitted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/claims/item/{itemId}")
    @PreAuthorize("hasAuthority('ROLE_SELLER')") // Only the seller should see claims on their item
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> listClaimsForItem(
            @PathVariable UUID itemId
    ) {
        log.info("Request received to list claims for item: {}", itemId);
        List<ClaimResponse> response = auctionService.listAllClaims(itemId);
        return ResponseEntity.ok(ApiResponse.success("Item claims retrieved successfully", response));
    }

    @PutMapping("/claims/{claimId}/review")
    @PreAuthorize("hasAuthority('ROLE_SELLER')") // Only the seller can review
    public ResponseEntity<ApiResponse<ClaimResponse>> reviewClaim(
            @PathVariable UUID claimId,
            @Valid @RequestBody ReviewClaimRequest request
    ) {
        log.info("Request received to review claim: {}", claimId);
        ClaimResponse response = auctionService.reviewClaim(claimId, request);
        return ResponseEntity.ok(ApiResponse.success("Item claim reviewed successfully", response));
    }

    @GetMapping("/me/claimed-items")
    public ResponseEntity<ApiResponse<Page<ClaimResponse>>> listAllClaimedItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("Request received to list 'my' claimed items");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reviewedAt"));
        Page<ClaimResponse> responses = auctionService.listAllClaimsOfUser(pageable);
        return ResponseEntity.ok(ApiResponse.success("Claimed items retrieved", responses));
    }

    @PostMapping("/claims/{claimId}/create-auction")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CREATE_AUCTION + "')")
    public ResponseEntity<ApiResponse<AuctionResponse>> createAuction(
            @PathVariable UUID claimId,
            @Valid @RequestBody CreateAuctionRequest request
    ) {
        log.info("Request received to create auction from claim: {}", claimId);
        AuctionResponse response = auctionService.createAuction(claimId, request);
        return new ResponseEntity<>(ApiResponse.success("Auction created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{auctionId}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.EDIT_AUCTION + "')")
    public ResponseEntity<ApiResponse<AuctionResponse>> updateAuction(
            @PathVariable UUID auctionId,
            @Valid @RequestBody UpdateAuctionRequest request
    ) {
        log.info("Request received to update auction: {}", auctionId);
        AuctionResponse response = auctionService.updateAuction(auctionId, request);
        return ResponseEntity.ok(ApiResponse.success("Auction updated successfully", response));
    }

    @PutMapping("/{auctionId}/cancel")
    @PreAuthorize("hasAuthority('" + PermissionConstants.CANCEL_AUCTION + "')")
    public ResponseEntity<ApiResponse<AuctionResponse>> cancelAuction(
            @PathVariable UUID auctionId
    ) {
        log.info("Request received to cancel auction: {}", auctionId);
        AuctionResponse response = auctionService.cancelAuction(auctionId);
        return ResponseEntity.ok(ApiResponse.success("Auction canceled successfully", response));
    }

    @GetMapping("/my-auctions")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VIEW_AUCTION + "')")
    public ResponseEntity<ApiResponse<Page<AuctionResponsePartial>>> listMyAuctions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startTime,desc") String sort
    ) {
        log.info("Request received to list 'my' auctions");
        Pageable pageable = createPageable(page, size, sort);
        Page<AuctionResponsePartial> response = auctionService.listMyAuctions(pageable);
        return ResponseEntity.ok(ApiResponse.success("My auctions retrieved", response));
    }

    @GetMapping("/{auctionId}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.VIEW_AUCTION + "')")
    public ResponseEntity<ApiResponse<AuctionResponse>> getAuctionDetails(
            @PathVariable UUID auctionId
    ) {
        log.info("Request received to get auction details for: {}", auctionId);
        AuctionResponse response = auctionService.getAuctionDetails(auctionId);
        return ResponseEntity.ok(ApiResponse.success("Auction details retrieved successfully", response));
    }

    // This endpoint is public, no auth needed
    @GetMapping("/{auctionId}/public")
    public ResponseEntity<ApiResponse<AuctionResponsePublic>> getPublicAuctionDetails(
            @PathVariable UUID auctionId
    ) {
        log.info("Request received to get PUBLIC auction details for: {}", auctionId);
        AuctionResponsePublic response = auctionService.getPublicAuctionDetails(auctionId);
        return ResponseEntity.ok(ApiResponse.success("Public auction details retrieved successfully", response));
    }

    // This endpoint is public, no auth needed
    @GetMapping("/by-status/{status}")
    public ResponseEntity<ApiResponse<Page<AuctionResponsePublic>>> listAuctionsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startTime,asc") String sort
    ) {
        log.info("Request received to get PUBLIC auctions by status: {}", status);
        Pageable pageable = createPageable(page, size, sort);
        Page<AuctionResponsePublic> response = auctionService
                .listAuctionsByStatus(AuctionEntity.AuctionStatus.valueOf(status.toUpperCase()), pageable);
        return ResponseEntity.ok(ApiResponse.success("Auctions retrieved", response));
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }
}