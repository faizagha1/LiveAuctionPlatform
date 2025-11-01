package com.liveauction.item.repository;

import com.liveauction.item.entity.ItemEntity;
import com.liveauction.item.entity.ItemEntity.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<ItemEntity, UUID> {

    Page<ItemEntity> findAllByOwnerId(UUID ownerId, Pageable pageable);
    Page<ItemEntity> findAllByStatus(ItemEntity.ItemStatus status, Pageable pageable);
    Page<ItemEntity> findAllByStatusAndOwnerIdNot(ItemEntity.ItemStatus status, UUID ownerId, Pageable pageable);
}