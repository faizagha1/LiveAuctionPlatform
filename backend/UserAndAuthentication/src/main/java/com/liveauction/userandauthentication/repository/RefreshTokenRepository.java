package com.liveauction.userandauthentication.repository;

import com.liveauction.userandauthentication.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {

    /**
     * Find refresh token by user ID
     * Used for logout and token cleanup
     */
    Optional<RefreshTokenEntity> findByUserId(UUID userId);

    /**
     * Find refresh token by token string and user ID
     * Used for token refresh validation
     */
    Optional<RefreshTokenEntity> findByTokenAndUserId(String token, UUID userId);

    /**
     * Delete all refresh tokens for a user
     * Used when password is reset for security
     *
     * @return
     */
    int deleteByUserId(UUID userId);

    /**
     * Check if refresh token exists for user
     */
    boolean existsByUserId(UUID userId);
}