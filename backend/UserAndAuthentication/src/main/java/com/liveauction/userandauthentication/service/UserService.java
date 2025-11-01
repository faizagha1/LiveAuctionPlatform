package com.liveauction.userandauthentication.service;

import com.liveauction.userandauthentication.dto.response.UserResponse;
import com.liveauction.userandauthentication.entity.UserEntity;
import com.liveauction.userandauthentication.exceptions.ResourceNotFoundException;
import com.liveauction.userandauthentication.exceptions.UnauthorizedException;
import com.liveauction.userandauthentication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get current user's profile
     */
    @Transactional(readOnly = true)
    public UserResponse getUserProfile() {
        log.info("Fetching user profile for authenticated user");
        UserEntity currentUser = getAuthenticatedUser();
        return UserResponse.fromEntity(currentUser);
    }

    /**
     * Helper method to get current authenticated user
     */
    @Transactional(readOnly = true)
    UserEntity getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserEntity user) {
            // Re-fetch from DB to ensure data is fresh and not just from the token
            return userRepository.findById(user.getId())
                    .orElseThrow(() -> {
                        log.error("Authenticated user with ID {} not found in database", user.getId());
                        return new ResourceNotFoundException("Authenticated user", "id", user.getId());
                    });
        }

        log.warn("Authenticated principal is not an instance of UserEntity: {}", principal.getClass().getName());
        throw new UnauthorizedException("Authenticated principal is of an unexpected type");
    }
}