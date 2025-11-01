package com.liveauction.userandauthentication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityService {
    // Injecting JwtService here is unnecessary as all methods rely on SecurityContextHolder

    public boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean authenticated = auth != null && auth.isAuthenticated() && !("anonymousUser").equals(auth.getPrincipal());
        log.debug("User authentication status: {}", authenticated);
        return authenticated;
    }

    public boolean hasRole(String role) {
        String roleName = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        boolean hasRole = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(roleName));
        log.debug("User has role {}: {}", roleName, hasRole);
        return hasRole;
    }

    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || ("anonymousUser").equals(auth.getPrincipal())) {
            log.error("Attempted to get current user ID when no user is authenticated.");
            throw new AccessDeniedException("No authenticated user session found.");
        }

        String userIdString = auth.getName();

        if (userIdString == null) {
            log.error("Authenticated principal has no name/subject in SecurityContext.");
            throw new IllegalStateException("Authenticated principal missing user ID.");
        }

        try {
            UUID userId = UUID.fromString(userIdString);
            log.debug("Current authenticated user ID: {}", userId);
            return userId;
        } catch (IllegalArgumentException ex) {
            log.error("Authenticated principal name is not a valid UUID: {}", userIdString, ex);
            throw new IllegalStateException("Authenticated principal name format is invalid.", ex);
        }
    }
}