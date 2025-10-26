package com.liveauction.userandauthentication.service;

import com.liveauction.userandauthentication.dto.response.UserResponse;
import com.liveauction.userandauthentication.entity.UserEntity;
import com.liveauction.userandauthentication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;

    /**
     * Get current user's profile
     */
    public UserResponse getUserProfile() {
        UserEntity currentUser = getAuthenticatedUser();
        return UserResponse.fromEntity(currentUser);
    }

    /**
     * Helper method to get current authenticated user
     */
    private UserEntity getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserEntity user) {
            return userRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        }
        
        throw new RuntimeException("No authenticated user found");
    }
}