package com.liveauction.item.controller;

import com.liveauction.item.dto.request.CreateItemRequest;
import com.liveauction.item.dto.request.UpdateItemRequest;
import com.liveauction.item.dto.response.ItemResponse;
import com.liveauction.item.dto.response.ItemResponsePartial;
import com.liveauction.item.dto.response.ItemResponsePublic;
import com.liveauction.item.service.ItemService;
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

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v2/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    /**
     * POST /api/v2/items
     * Create a new item (Requires ROLE_SELLER permission)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(
            @Valid @RequestBody CreateItemRequest request
    ) {
        log.info("Request received to create item: {}", request.name());
        ItemResponse response = itemService.createItem(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item created successfully", response));
    }

    /**
     * PUT /api/v2/items/{itemId}
     * Update an existing item (Owner only)
     */
    @PutMapping("/{itemId}")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateItemRequest request
    ) {
        log.info("Request received to update item: {}", itemId);
        ItemResponse response = itemService.updateItem(itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Item updated successfully", response));
    }

    /**
     * GET /api/v2/items/my-items
     * List all items owned by current user
     */
    @GetMapping("/my-items")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<Page<ItemResponse>>> listMyItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        log.info("Request received to list 'my-items' for current user");
        Pageable pageable = createPageable(page, size, sort);
        Page<ItemResponse> response = itemService.listMyItems(pageable);
        return ResponseEntity.ok(ApiResponse.success("Items retrieved successfully", response));
    }

    /**
     * GET /api/v2/items/my-items/{itemId}
     * Get full item details (Owner only)
     */
    @GetMapping("/my-items/{itemId}")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<ItemResponse>> getMyItemDetails(
            @PathVariable UUID itemId
    ) {
        log.info("Request received to get 'my-item' details for: {}", itemId);
        ItemResponse response = itemService.getItemDetails(itemId);
        return ResponseEntity.ok(ApiResponse.success("Item details retrieved successfully", response));
    }

    /**
     * POST /api/v2/items/my-items/{itemId}/mark-for-approval
     * Submit an item for admin review
     */
    @PostMapping("/my-items/{itemId}/mark-for-approval")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<ItemResponse>> markItemForApproval(
            @PathVariable UUID itemId
    ){
        log.info("Request received to mark item for approval: {}", itemId);
        ItemResponse response = itemService.markForApproval(itemId);
        return ResponseEntity.ok(ApiResponse.success("Item marked for approval successfully", response));
    }

    /**
     * GET /api/v2/items/{itemId}
     * Get public item details (Anyone can view)
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<ApiResponse<ItemResponsePublic>> getPublicItemDetails(
            @PathVariable UUID itemId
    ) {
        log.info("Request received to get public details for item: {}", itemId);
        ItemResponsePublic response = itemService.getPublicItemDetails(itemId);
        return ResponseEntity.ok(ApiResponse.success("Public item details retrieved successfully", response));
    }

    /**
     * GET /api/v2/items/listed-for-claims
     * List items available for auctioneers to claim (Authenticated users only)
     */
    @GetMapping("/listed-for-claims")
    @PreAuthorize("hasAuthority('VIEW_ITEM')")
    public ResponseEntity<ApiResponse<Page<ItemResponsePartial>>> listItemsForClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        log.info("Request received to list items available for claiming");
        Pageable pageable = createPageable(page, size, sort);
        Page<ItemResponsePartial> response = itemService.getItemsListedForClaiming(pageable);
        return ResponseEntity.ok(ApiResponse.success("Items listed for claims retrieved", response));
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }
}