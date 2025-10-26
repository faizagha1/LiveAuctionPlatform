package com.liveauction.userandauthentication.repository;

import com.liveauction.userandauthentication.entity.VerificationTokenEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationTokenEntity, UUID> {
    Optional<VerificationTokenEntity> findByToken(String token);

    Optional<VerificationTokenEntity>findByTokenAndExpiryDateAfter(String token, Instant expiryDateAfter);

    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationTokenEntity t WHERE t.token = :token AND t.expiryDate > :now")
    int deleteValidToken(@Param("token") String token, @Param("now") Instant now);

    @Query("SELECT t.userId FROM VerificationTokenEntity t WHERE t.token = :token AND t.expiryDate > :now")
    Optional<UUID> findUserIdByTokenAndExpiryDateAfter(@Param("token") String token, @Param("now") Instant now);

}
