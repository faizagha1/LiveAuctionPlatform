package com.liveauction.userandauthentication.repository;

import com.liveauction.userandauthentication.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findById(UUID id);

    Optional<UserEntity> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
