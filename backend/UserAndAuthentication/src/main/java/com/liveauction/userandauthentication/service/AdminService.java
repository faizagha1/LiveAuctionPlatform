package com.liveauction.userandauthentication.service;

import com.liveauction.shared.constants.RoleConstants;
import com.liveauction.userandauthentication.dto.request.AuctioneerApplicationReviewRequest;
import com.liveauction.userandauthentication.dto.response.AuctioneerApplication;
import com.liveauction.userandauthentication.dto.response.AuctioneerApplicationLimited;
import com.liveauction.userandauthentication.dto.response.AuctioneerApplicationReviewResponse;
import com.liveauction.userandauthentication.entity.*;
import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationReviewResponseEnum;
import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationStatus;
import com.liveauction.userandauthentication.exceptions.ResourceConflictException;
import com.liveauction.userandauthentication.exceptions.ResourceNotFoundException;
import com.liveauction.userandauthentication.exceptions.UnauthorizedException;
import com.liveauction.userandauthentication.repository.AuctioneerApplicationRepository;
import com.liveauction.userandauthentication.repository.AuctioneerApplicationReviewRepository;
import com.liveauction.userandauthentication.repository.RoleRepository;
import com.liveauction.userandauthentication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuctioneerApplicationRepository auctioneerApplicationRepository;
    private final AuctioneerApplicationReviewRepository auctioneerApplicationReviewRepository;
    private final SecurityService securityService;

    @Transactional(readOnly = true)
    public Page<AuctioneerApplicationLimited> listAllApplications(Pageable pageable) {
        log.info("Fetching all auctioneer applications, page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<AuctioneerApplicationEntity> applications = auctioneerApplicationRepository.findAll(pageable);
        return applications.map(a -> AuctioneerApplicationLimited.fromEntity(a, userRepository.findById(a.getUserId()).
                orElseThrow(() -> new ResourceNotFoundException("User not found"))));
    }

    @Transactional(readOnly = true)
    public Page<AuctioneerApplicationLimited> listAllAuctioneerApplicationsByStatus(
            AuctioneerApplicationStatus status,
            Pageable pageable
    ) {
        log.info("Fetching auctioneer applications with status: {}, page: {}, size: {}", status, pageable.getPageNumber(), pageable.getPageSize());
        Page<AuctioneerApplicationEntity> applications = auctioneerApplicationRepository
                .findAllByStatus(status, pageable);
        return applications.map(a -> AuctioneerApplicationLimited.fromEntity(a, userRepository.findById(a.getUserId()).
                orElseThrow(() -> new ResourceNotFoundException("User not found"))));    }

    @Transactional(readOnly = true)
    public AuctioneerApplication getDetailsOfAuctioneerApplication(UUID applicationId) {
        log.info("Fetching details for auctioneer application: {}", applicationId);
        AuctioneerApplicationEntity applicationEntity = auctioneerApplicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Auctioneer application", "id", applicationId));
        return AuctioneerApplication.fromEntity(applicationEntity, userRepository.findById(applicationEntity.getUserId()).
                orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @Transactional
    public AuctioneerApplicationReviewResponse reviewRequest(
            UUID applicationId,
            AuctioneerApplicationReviewRequest request
    ) {
        log.info("Reviewing auctioneer application: {}", applicationId);
        if (!securityService.hasRole(RoleConstants.ROLE_ADMIN)) {
            log.warn("Unauthorized attempt to review application by user: {}", securityService.getCurrentUserId());
            throw new UnauthorizedException("User does not have admin role");
        }

        // Pessimistic lock to prevent race condition
        AuctioneerApplicationEntity application = auctioneerApplicationRepository
                .findByIdWithLock(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Auctioneer application", "id", applicationId));

        // Check if already reviewed
        if (application.getStatus() != AuctioneerApplicationStatus.PENDING) {
            log.warn("Attempted to review an already-processed application: {}", applicationId);
            throw new ResourceConflictException("Application has already been reviewed");
        }

        UUID adminId = securityService.getCurrentUserId();
        log.info("Application {} is being reviewed by admin: {}", applicationId, adminId);

        AuctioneerApplicationReview auctioneerApplicationReview = AuctioneerApplicationReview
                .builder()
                .reviewerId(adminId)
                .response(request.response())
                .comment(request.comment())
                .build();
        auctioneerApplicationReview = auctioneerApplicationReviewRepository.save(auctioneerApplicationReview);

        if (!auctioneerApplicationReview.getResponse().equals(AuctioneerApplicationReviewResponseEnum.APPROVED)) {
            application.setStatus(AuctioneerApplicationStatus.DENIED);
            auctioneerApplicationRepository.save(application);
            log.info("Application {} DENIED by admin: {}", applicationId, adminId);
            return AuctioneerApplicationReviewResponse.fromEntity(auctioneerApplicationReview, application);
        }

        // Grant auctioneer role
        UserEntity user = userRepository
                .findById(application.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", application.getUserId()));

        RoleEntity roleAuctioneer = roleRepository
                .findByName(RoleConstants.ROLE_AUCTIONEER)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", RoleConstants.ROLE_AUCTIONEER));

        user.getRoles().add(roleAuctioneer);
        userRepository.save(user);

        application.setStatus(AuctioneerApplicationStatus.APPROVED);
        auctioneerApplicationRepository.save(application);

        log.info("Application {} APPROVED by admin: {}. User {} granted ROLE_AUCTIONEER.", applicationId, adminId, user.getId());
        return AuctioneerApplicationReviewResponse.fromEntity(auctioneerApplicationReview, application);
    }

    private String extractUsername(AuctioneerApplicationEntity application) {
        UserEntity user = userRepository
                .findById(application.getUserId())
                .orElseThrow(() -> {
                    log.error("Could not find user with ID: {} for application: {}", application.getUserId(), application.getId());
                    return new ResourceNotFoundException("User", "id", application.getUserId());
                });
        return user.getUsername();
    }
}