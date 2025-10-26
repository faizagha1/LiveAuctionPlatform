package com.liveauction.item.service;

import com.liveauction.item.dto.request.CreateItemRequest;
import com.liveauction.item.dto.request.UpdateItemRequest;
import com.liveauction.item.dto.response.ItemResponse;
import com.liveauction.item.dto.response.ItemResponseAuctioneer;
import com.liveauction.item.dto.response.ItemResponsePartial;
import com.liveauction.item.dto.response.ItemResponsePublic;
import com.liveauction.item.entity.ItemEntity;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.liveauction.item.repository.ItemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {
    
    private final ItemRepository itemRepository;

    /**
     * Create a new item
     * - Get current user ID from SecurityContext
     * - Build ItemEntity with status = APPROVED (V1: skip admin review)
     * - Save to database
     * - TODO: Publish ResourceCreatedEvent for Auth Service
     */
    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        log.info("Creating item: {}", request.name());
        ItemEntity item = ItemEntity.builder()
                .ownerId(getCurrentUserId())
                .name(request.name())
                .description(request.description())
                .category(request.category())
                .condition(request.condition())
                .startingPrice(request.startingPrice())
                .reservePrice(request.reservePrice())
                .bidIncrement(request.bidIncrement())
                .build();
        log.info("Built the item and now saving item to database");
        item = itemRepository.save(item);
        log.info("Item saved with ID: {}", item.getId());
        return ItemResponse.fromEntity(item);
    }

    /**
     * Update an existing item
     * - Verify item exists
     * - Verify current user is the owner
     * - Verify item status is DRAFT or APPROVED (can't edit if in auction)
     * - Update fields
     * - Save
     */
    @Transactional
    public ItemResponse updateItem(UUID itemId, UpdateItemRequest request) {
        log.info("Updating item: {}", itemId);
        log.info("Trying to find the item in the database");
        ItemEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        log.info("Item found: {}", item.getName());
        log.info("Checking if the current user is the owner of the item");
        UUID currentUserId = getCurrentUserId();
        if (!item.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: Not the item owner, can not make changes");
        }
        log.info("Current user is the owner, proceeding with update");
        log.info("Checking status of item");
        if (item.getStatus() != ItemEntity.ItemStatus.DRAFT && item.getStatus() != ItemEntity.ItemStatus.APPROVED) {
            throw new RuntimeException("Item cannot be edited in its current status");
        }
        log.info("Item status is valid for editing, updating fields");
        item.setName(request.name());
        item.setDescription(request.description());
        item.setCategory(request.category());
        item.setCondition(request.condition());
        item.setStartingPrice(request.startingPrice());
        item.setReservePrice(request.reservePrice());
        item.setBidIncrement(request.bidIncrement());
        log.info("Saving updated item to database");
        item = itemRepository.save(item);
        log.info("Item updated successfully: {}", item.getId());
        return ItemResponse.fromEntity(item);
    }

    /**
     * List all items owned by current user
     */
    public List<ItemResponsePartial> listMyItems() {
        log.info("Finding current userid");
        UUID userId = getCurrentUserId();
        log.info("Current user id: {}", userId);
        log.info("Fetching items for user from database with the userId: " + userId);
        List<ItemEntity> items = itemRepository.findAllByOwnerId(userId)
                .orElse(new ArrayList<>());
        log.info("Found {} items for user", items.size());
        List<ItemResponsePartial> response = items.stream()
                .map(ItemResponsePartial::fromEntity)
                .toList();
        log.info("Mapped items to response DTOs");
        return response;
    }

    /**
     * Get full item details (owner only)
     */
    public ItemResponse getItemDetails(UUID itemId) {
        ItemEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        UUID currentUserId = getCurrentUserId();
        if (!item.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized: Not the item owner");
        }
        return ItemResponse.fromEntity(item);
    }

    public ItemResponseAuctioneer getItemDetailsForAuctioneers(UUID itemId) {
        ItemEntity item = itemRepository
                .findById(itemId)
                .orElseThrow(() -> new RuntimeException("No item found"));
        if (item.getStatus() != ItemEntity.ItemStatus.APPROVED) {
            throw new RuntimeException("Item is not approved");
        }
        return ItemResponseAuctioneer.toResponse(item);
    }

    /**
     * Get public item details (anyone can view APPROVED items)
     */
    public ItemResponsePublic getPublicItemDetails(UUID itemId) {
        ItemEntity item = itemRepository
                .findById(itemId)
                .orElseThrow(() -> new RuntimeException("No item found"));
        if (item.getStatus() != ItemEntity.ItemStatus.APPROVED) {
            throw new RuntimeException("Item is not available for public viewing");
        }
        return ItemResponsePublic.fromEntity(item);
    }

    public List<ItemResponsePublic> getItemsListedForClaiming() {
        List<ItemEntity> items = itemRepository
                .findAllByStatusAndOwnerIdNot(
                        ItemEntity.ItemStatus.APPROVED,
                        getCurrentUserId()
                );
        return items.stream()
                .map(ItemResponsePublic::fromEntity)
                .toList();
    }

    /**
     * Helper: Get current authenticated user ID
     */
    private UUID getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }
        throw new RuntimeException("No authenticated user found");
    }
}
