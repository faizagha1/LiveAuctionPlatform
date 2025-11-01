package com.liveauction.userandauthentication.controller;

import com.liveauction.shared.dto.response.ApiResponse;
import com.liveauction.userandauthentication.dto.request.AuctioneerApplicationReviewRequest;
import com.liveauction.userandauthentication.dto.response.AuctioneerApplication;
import com.liveauction.userandauthentication.dto.response.AuctioneerApplicationLimited;
import com.liveauction.userandauthentication.dto.response.AuctioneerApplicationReviewResponse;
import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationStatus;
import com.liveauction.userandauthentication.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v2/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<Page<AuctioneerApplicationLimited>>> listAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "appliedAt,desc") String sort
    ) {
        log.info("Request received to list all applications: page={}, size={}, sort={}", page, size, sort);
        Pageable pageable = createPageable(page, size, sort);
        Page<AuctioneerApplicationLimited> response = adminService.listAllApplications(pageable);
        return ResponseEntity.ok(ApiResponse.success("Applications fetched successfully", response));
    }

    @GetMapping("/applications/pending-applications")
    public ResponseEntity<ApiResponse<Page<AuctioneerApplicationLimited>>> listAllPendingApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "appliedAt,desc") String sort
    ) {
        log.info("Request received to list all PENDING applications: page={}, size={}, sort={}", page, size, sort);
        Pageable pageable = createPageable(page, size, sort);
        Page<AuctioneerApplicationLimited> response = adminService
                .listAllAuctioneerApplicationsByStatus(AuctioneerApplicationStatus.PENDING, pageable);
        return ResponseEntity.ok(ApiResponse.success("Pending applications fetched", response));
    }

    @GetMapping("applications/pending-applications/{applicationId}")
    public ResponseEntity<ApiResponse<AuctioneerApplication>> getApplicationDetailsById(
            @PathVariable("applicationId") UUID applicationId
    ) {
        log.info("Request received to get details for application: {}", applicationId);
        AuctioneerApplication response = adminService.getDetailsOfAuctioneerApplication(applicationId);
        return ResponseEntity.ok(ApiResponse.success("Pending auctioneer application details fetched successfully", response));
    }

    @PostMapping("applications/pending-applications/{applicationId}/review")
    public ResponseEntity<ApiResponse<AuctioneerApplicationReviewResponse>> reviewAuctioneerApplication(
            @PathVariable("applicationId") UUID applicationId,
            @Valid @RequestBody AuctioneerApplicationReviewRequest request
    ) {
        log.info("Request received to review application: {}", applicationId);
        AuctioneerApplicationReviewResponse response = adminService.reviewRequest(applicationId, request);
        return ResponseEntity.ok(ApiResponse.success("Auctioneer application reviewed successfully", response));
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }
}