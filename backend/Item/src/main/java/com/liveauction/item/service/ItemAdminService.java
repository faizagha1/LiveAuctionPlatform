package com.liveauction.item.service;

import com.liveauction.item.dto.request.ItemReview;
import com.liveauction.item.dto.response.ItemResponse;
import com.liveauction.item.entity.ItemEntity;
import com.liveauction.item.exceptions.BadRequestException;
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
public class ItemAdminService {

    private final ItemRepository itemRepository;
    private final SecurityService securityService;

    @Transactional(readOnly = true)
    public Page<ItemResponse> getAllItemsListedForReview(Pageable pageable) {
        log.info("Admin service checking permissions for 'REVIEW_ITEMS'");
        if (!securityService.hasPermission("REVIEW_ITEMS")) {
            UUID userId = securityService.getCurrentUserId();
            log.warn("User {} does not have permission 'REVIEW_ITEMS'", userId);
            throw new UnauthorizedException("You do not have permission to review items.");
        }

        log.info("Fetching all items with status PENDING_APPROVAL");
        Page<ItemEntity> itemsMarkedForReview = itemRepository
                .findAllByStatus(ItemEntity.ItemStatus.PENDING_APPROVAL, pageable);
        return itemsMarkedForReview.map(ItemResponse::fromEntity);
    }

    public String reviewItem(UUID itemId, ItemReview itemReview) {
        log.info("Admin service checking permissions for 'REVIEW_ITEMS'");
        if (!securityService.hasPermission("REVIEW_ITEMS")) {
            UUID userId = securityService.getCurrentUserId();
            log.warn("User {} does not have permission 'REVIEW_ITEMS'", userId);
            throw new UnauthorizedException("You do not have permission to review items.");
        }

        log.info("Fetching item with the given id : {}", itemId);
        ItemEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item with id " + itemId + " not found."));
        if(!item.getStatus().equals(ItemEntity.ItemStatus.PENDING_APPROVAL)) {
            log.error("Item has already been approved");
            throw new BadRequestException("Item is not in pending approval");
        }
        if(itemReview.response().equals("APPROVED")) {
            log.info("Item with id {} has been approved", itemId);
            item.setStatus(ItemEntity.ItemStatus.APPROVED);
        }
        else if(itemReview.response().equals("REJECTED")) {
            log.info("Item with id {} has been rejected", itemId);
            item.setStatus(ItemEntity.ItemStatus.REJECTED);
        }
        itemRepository.save(item);
        log.info("Item status has been set to {}", item.getStatus());
        return item.getStatus().toString();
    }
}