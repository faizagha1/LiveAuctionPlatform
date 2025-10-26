package com.liveauction.userandauthentication.repository;

import com.liveauction.userandauthentication.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {
    
    Optional<RoleEntity> findByName(String name);
}