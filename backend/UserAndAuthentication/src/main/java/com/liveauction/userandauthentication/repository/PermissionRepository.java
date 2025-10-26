package com.liveauction.userandauthentication.repository;

import com.liveauction.userandauthentication.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<PermissionEntity, UUID> {
    
    Optional<PermissionEntity> findByName(String name);
}