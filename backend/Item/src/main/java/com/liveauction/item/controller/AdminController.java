package com.liveauction.item.controller;

import com.liveauction.item.dto.request.ItemReview;
import com.liveauction.item.dto.response.ItemResponse;
import com.liveauction.item.service.ItemAdminService;
import com.liveauction.shared.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v2/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ItemAdminService itemAdminService;

    /**
     * GET /api/v2/admin/items-for-review
     * Get paged list of items with status PENDING_APPROVAL
     */
    @GetMapping("/items-for-review")
    @PreAuthorize("hasAuthority('REVIEW_ITEMS')")
    public ResponseEntity<ApiResponse<Page<ItemResponse>>> getItemsForReview(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        log.info("Admin request received for items pending review");
        Pageable pageable = createPageable(page, size, sort);
        Page<ItemResponse> responses = itemAdminService.getAllItemsListedForReview(pageable);
        return ResponseEntity.ok(ApiResponse.success("Items for review retrieved successfully", responses));
    }

    @PostMapping("/items-for-review/{itemId}/review")
    @PreAuthorize("hasAuthority('REVIEW_ITEMS')")
    public ResponseEntity<ApiResponse<String>> reviewItem(
            @PathVariable("itemId") UUID itemId,
            @RequestBody ItemReview itemReview
            ) {
        String response = itemAdminService.reviewItem(itemId, itemReview);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }
}