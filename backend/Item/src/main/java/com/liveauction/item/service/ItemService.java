package com.liveauction.item.service;

import com.liveauction.item.dto.request.CreateItemRequest;
import com.liveauction.item.dto.request.UpdateItemRequest;
import com.liveauction.item.dto.response.ItemResponse;
import com.liveauction.item.dto.response.ItemResponseAuctioneer;
import com.liveauction.item.dto.response.ItemResponsePartial;
import com.liveauction.item.dto.response.ItemResponsePublic;
import com.liveauction.item.entity.ItemEntity;
import com.liveauction.item.event.producer.ItemEventProducer;
import com.liveauction.item.exceptions.BadRequestException;
import com.liveauction.item.exceptions.ResourceConflictException;
import com.liveauction.item.exceptions.ResourceNotFoundException;
import com.liveauction.item.exceptions.UnauthorizedException;
import com.liveauction.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository itemRepository;
    private final SecurityService securityService;
    private final ItemEventProducer itemEventProducer;

    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} creating item: {}", currentUserId, request.name());

        if (request.startingPrice().compareTo(request.reservePrice()) >= 0) {
            throw new BadRequestException("Starting price must be less than reserve price");
        }

        ItemEntity item = ItemEntity.builder()
                .ownerId(currentUserId)
                .name(request.name())
                .description(request.description())
                .category(request.category())
                .condition(request.condition())
                .startingPrice(request.startingPrice())
                .reservePrice(request.reservePrice())
                .bidIncrement(request.bidIncrement())
                .status(ItemEntity.ItemStatus.DRAFT)
                .build();

        log.info("Saving new item to database for user: {}", currentUserId);
        item = itemRepository.save(item);
        log.info("Item saved with ID: {}. Publishing event.", item.getId());

        // Publish event
//        itemEventProducer.itemCreated(item);

        return ItemResponse.fromEntity(item);
    }

    @Transactional
    public ItemResponse updateItem(UUID itemId, UpdateItemRequest request) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} updating item: {}", currentUserId, itemId);

        ItemEntity item = findItemByIdOrThrow(itemId);
        log.info("Item found: {}", item.getName());

        if (!item.getOwnerId().equals(currentUserId)) {
            log.warn("User {} does not own item {}. Update forbidden.", currentUserId, itemId);
            throw new UnauthorizedException("You are not the owner of this item.");
        }
        log.info("User {} is owner, proceeding with update", currentUserId);

        if (item.getStatus() != ItemEntity.ItemStatus.DRAFT && item.getStatus() != ItemEntity.ItemStatus.REJECTED) {
            log.warn("Item {} cannot be edited in its current status: {}", itemId, item.getStatus());
            throw new ResourceConflictException("Item cannot be edited unless it is in DRAFT or REJECTED status");
        }

        log.info("Item status is valid for editing, updating fields");
        item.setName(request.name());
        item.setDescription(request.description());
        item.setCategory(request.category());
        item.setCondition(request.condition());
        item.setStartingPrice(request.startingPrice());
        item.setReservePrice(request.reservePrice());
        item.setBidIncrement(request.bidIncrement());

        log.info("Saving updated item to database: {}", item.getId());
        item = itemRepository.save(item);

        // Publish event
//        itemEventProducer.itemUpdated(item);

        return ItemResponse.fromEntity(item);
    }

    @Transactional(readOnly = true)
    public Page<ItemResponse> listMyItems(Pageable pageable) {
        UUID userId = securityService.getCurrentUserId();
        log.info("Fetching items for owner: {}", userId);
        Page<ItemEntity> items = itemRepository.findAllByOwnerId(userId, pageable);
        return items.map(ItemResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ItemResponse getItemDetails(UUID itemId) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} fetching details for item: {}", currentUserId, itemId);

        ItemEntity item = findItemByIdOrThrow(itemId);

        if (!item.getOwnerId().equals(currentUserId)) {
            log.warn("User {} does not own item {}. Access forbidden.", currentUserId, itemId);
            throw new UnauthorizedException("You are not the owner of this item.");
        }
        return ItemResponse.fromEntity(item);
    }

    @Transactional(readOnly = true)
    public ItemResponseAuctioneer getItemDetailsForAuctioneers(UUID itemId) {
        log.info("Auctioneer fetching details for item: {}", itemId);
        ItemEntity item = findItemByIdOrThrow(itemId);

        if (item.getStatus() != ItemEntity.ItemStatus.APPROVED) {
            log.warn("Item {} is not in APPROVED state. Status: {}", itemId, item.getStatus());
            throw new ResourceConflictException("Item is not approved for auction");
        }
        return ItemResponseAuctioneer.toResponse(item);
    }

    @Transactional(readOnly = true)
    public ItemResponsePublic getPublicItemDetails(UUID itemId) {
        log.info("Fetching public details for item: {}", itemId);
        ItemEntity item = findItemByIdOrThrow(itemId);

        if (item.getStatus() != ItemEntity.ItemStatus.APPROVED) {
            log.warn("Public access denied for item {} (Status: {})", itemId, item.getStatus());
            throw new ResourceConflictException("This item is not currently available for public viewing.");
        }
        return ItemResponsePublic.fromEntity(item);
    }

    @Transactional(readOnly = true)
    public Page<ItemResponsePartial> getItemsListedForClaiming(Pageable pageable) {
        UUID currentUserId = securityService.getCurrentUserId();
        log.info("User {} fetching items listed for claiming", currentUserId);

        Page<ItemEntity> items = itemRepository
                .findAllByStatusAndOwnerIdNot(ItemEntity.ItemStatus.APPROVED, currentUserId, pageable);
        return items.map(ItemResponsePartial::fromEntity);
    }

    @Transactional
    public ItemResponse markForApproval(UUID itemId) {
        UUID userId = securityService.getCurrentUserId();
        log.info("User {} marking item for approval: {}", userId, itemId);

        ItemEntity item = findItemByIdOrThrow(itemId);

        if (!item.getOwnerId().equals(userId)) {
            log.warn("User {} does not own item {}. Action forbidden.", userId, itemId);
            throw new UnauthorizedException("You are not the owner of this item.");
        }

        if (item.getStatus() == ItemEntity.ItemStatus.PENDING_APPROVAL) {
            throw new ResourceConflictException("Item is already pending approval");
        }
        if (item.getStatus() != ItemEntity.ItemStatus.DRAFT) {
            throw new ResourceConflictException("Only DRAFT items can be submitted for approval");
        }

        item.setStatus(ItemEntity.ItemStatus.PENDING_APPROVAL);
        item = itemRepository.save(item);
        log.info("Item {} status set to {} ", item.getId(), item.getStatus());

        // TODO: Publish an ItemSubmittedForReviewEvent

        return ItemResponse.fromEntity(item);
    }

    private ItemEntity findItemByIdOrThrow(UUID itemId) {
        return itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));
    }
}