package com.liveauction.auction.controller;

import com.liveauction.auction.dto.request.ClaimItemRequest;
import com.liveauction.auction.dto.request.CreateAuctionRequest;
import com.liveauction.auction.dto.request.ReviewClaimRequest;
import com.liveauction.auction.dto.request.UpdateAuctionRequest;
import com.liveauction.auction.dto.response.*;
import com.liveauction.auction.entity.AuctionEntity;
import com.liveauction.auction.service.AuctionService;
import com.liveauction.shared.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/auctions")
@RequiredArgsConstructor
public class AuctionController {
    
    private final AuctionService auctionService;

    @PostMapping("/claim")
    public ResponseEntity<ApiResponse<ClaimResponse>> claimItem(
            @Valid @RequestBody ClaimItemRequest request
    ) {
        ClaimResponse response = auctionService.claimItem(request);
        ApiResponse<ClaimResponse> apiResponse = new ApiResponse<>(true, "Item claim submitted successfully", response);
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/claims/item/{itemId}")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> listClaimsForItem(
            @PathVariable UUID itemId
    ) {
        List<ClaimResponse> response = auctionService.listAllClaims(itemId);
        ApiResponse<List<ClaimResponse>> apiResponse = new ApiResponse<>(true, "Item claim reviewed successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/claims/{claimId}/review")
    public ResponseEntity<ApiResponse<ClaimResponse>> reviewClaim(
            @PathVariable UUID claimId,
            @Valid @RequestBody ReviewClaimRequest request
    ) {
        ClaimResponse response = auctionService.reviewClaim(claimId, request);
        ApiResponse<ClaimResponse> apiResponse = new ApiResponse<>(true, "Item claim reviewed successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/me/claimed-items")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> listAllClaimedItems(
    ) {
        List<ClaimResponse> responses = auctionService.listAllClaimsOfUser();
        ApiResponse<List<ClaimResponse>> apiResponse = new ApiResponse<>(true, "Item claim reviewed successfully", responses);
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/claims/{claimId}/create-auction")
    public ResponseEntity<ApiResponse<AuctionResponse>> createAuction(
            @PathVariable UUID claimId,
            @Valid @RequestBody CreateAuctionRequest request
    ) {
        AuctionResponse response = auctionService.createAuction(claimId, request);
        ApiResponse<AuctionResponse> apiResponse = new ApiResponse<>(true, "Auction created successfully", response);
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PutMapping("/{auctionId}")
    public ResponseEntity<ApiResponse<AuctionResponse>> updateAuction(
            @PathVariable UUID auctionId,
            @Valid @RequestBody UpdateAuctionRequest request
    ) {
        AuctionResponse response = auctionService.updateAuction(auctionId, request);
        ApiResponse<AuctionResponse> apiResponse = new ApiResponse<>(true, "Auction updated successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{auctionId}/cancel")
    public ResponseEntity<ApiResponse<AuctionResponse>> cancelAuction(
            @PathVariable UUID auctionId
    ) {
        AuctionResponse response = auctionService.cancelAuction(auctionId);
        ApiResponse<AuctionResponse> apiResponse = new ApiResponse<>(true, "Auction canceled successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/my-auctions")
    public ResponseEntity<ApiResponse<List<AuctionResponsePartial>>> listMyAuctions(
    ) {
        List<AuctionResponsePartial> response = auctionService.listMyAuctions();
        ApiResponse<List<AuctionResponsePartial>> apiResponse = new ApiResponse<>(true, "My auctions retrieved successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{auctionId}")
    public ResponseEntity<ApiResponse<AuctionResponse>> getAuctionDetails(
            @PathVariable UUID auctionId
    ) {
        AuctionResponse response = auctionService.getAuctionDetails(auctionId);
        ApiResponse<AuctionResponse> apiResponse = new ApiResponse<>(true, "Auction details retrieved successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{auctionId}/public")
    public ResponseEntity<ApiResponse<AuctionResponsePublic>> getPublicAuctionDetails(
            @PathVariable UUID auctionId
    ) {
        AuctionResponsePublic response = auctionService.getPublicAuctionDetails(auctionId);
        ApiResponse<AuctionResponsePublic> apiResponse = new ApiResponse<>(true, "Public auction details retrieved successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/by-status/{status}")
    public ResponseEntity<ApiResponse<List<AuctionResponsePublic>>> listAuctionsByStatus(
            @PathVariable String status
    ) {
        List<AuctionResponsePublic> response = auctionService.listAuctionsByStatus(AuctionEntity.AuctionStatus.valueOf(status));
        ApiResponse<List<AuctionResponsePublic>> apiResponse = new ApiResponse<>(true, "Auctions by status retrieved successfully", response);
        return ResponseEntity.ok(apiResponse);
    }
}