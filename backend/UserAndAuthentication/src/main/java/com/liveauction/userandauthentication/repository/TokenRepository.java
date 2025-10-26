package com.liveauction.userandauthentication.repository;

import com.liveauction.userandauthentication.entity.VerificationTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TokenRepository extends JpaRepository<VerificationTokenEntity, UUID> {
}
