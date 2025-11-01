package com.liveauction.item.service;

import com.liveauction.item.exceptions.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.UUID;

@Service
public class SecurityService {

    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("No authenticated user found in security context");
        }
        
        Object principal = auth.getPrincipal();
        if (principal instanceof UUID userId) {
            return userId;
        }
        
        throw new UnauthorizedException("Authenticated principal is not a valid user ID");
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities();
    }

    public boolean hasPermission(String permission) {
        return getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(permission));
    }
}