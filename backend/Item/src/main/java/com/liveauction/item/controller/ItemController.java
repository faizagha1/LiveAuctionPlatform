package com.liveauction.item.controller;

import com.liveauction.item.dto.request.CreateItemRequest;
import com.liveauction.item.dto.request.UpdateItemRequest;
import com.liveauction.item.dto.response.ItemResponse;
import com.liveauction.item.dto.response.ItemResponseAuctioneer;
import com.liveauction.item.dto.response.ItemResponsePartial;
import com.liveauction.item.dto.response.ItemResponsePublic;
import com.liveauction.item.service.ItemService;
import com.liveauction.shared.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    /**
     * POST /api/v2/items
     * Create a new item
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(
            @Valid @RequestBody CreateItemRequest request
    ) {
        ItemResponse response = itemService.createItem(request);
        ApiResponse<ItemResponse> apiResponse = new ApiResponse<>(true, "Item created successfully", response);
        return ResponseEntity.status(201).body(apiResponse);
    }

    /**
     * PUT /api/v2/items/{itemId}
     * Update an existing item
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateItemRequest request
    ) {
        ItemResponse response = itemService.updateItem(itemId, request);
        ApiResponse<ItemResponse> apiResponse = new ApiResponse<>(true, "Item created successfully", response);
        return ResponseEntity.status(201).body(apiResponse);
    }

    /**
     * GET /api/v2/items/my-items
     * List all items owned by current user
     */
    @GetMapping("/my-items")
    public ResponseEntity<ApiResponse<List<ItemResponsePartial>>> listMyItems() {
        List<ItemResponsePartial> response = itemService.listMyItems();
        ApiResponse<List<ItemResponsePartial>> apiResponse = new ApiResponse<>(true, "Items retrieved successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * GET /api/v2/items/my-items/{itemId}
     * Get full item details (owner only)
     */
    @GetMapping("/my-items/{itemId}")
    public ResponseEntity<ApiResponse<ItemResponse>> getMyItemDetails(
            @PathVariable UUID itemId
    ) {
        ItemResponse response = itemService.getItemDetails(itemId);
        ApiResponse<ItemResponse> apiResponse = new ApiResponse<>(true, "Item details retrieved successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * GET /api/v2/items/{itemId}
     * Get public item details (anyone can view)
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<ApiResponse<ItemResponsePublic>> getPublicItemDetails(
            @PathVariable UUID itemId
    ) {
        ItemResponsePublic response = itemService.getPublicItemDetails(itemId);
        ApiResponse<ItemResponsePublic> apiResponse = new ApiResponse<>(true, "Public item details retrieved successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/listed-for-claims")
    public ResponseEntity<ApiResponse<List<ItemResponsePublic>>> listItemsForClaims() {
        List<ItemResponsePublic> response = itemService.getItemsListedForClaiming();
        ApiResponse<List<ItemResponsePublic>> apiResponse = new ApiResponse<>(true, "Items listed for claims retrieved successfully", response);
        return ResponseEntity.ok(apiResponse);
    }
}
