package com.liveauction.item.repository;

import com.liveauction.item.entity.ItemEntity;
import com.liveauction.item.entity.ItemEntity.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<ItemEntity, UUID> {
    
    // Find all items by owner
    Optional<List<ItemEntity>> findAllByOwnerId(UUID ownerId);
    
    // Find items by status (for admin review)
    Optional<List<ItemEntity>> findAllByStatus(ItemStatus status);

    List<ItemEntity> findAllByStatusAndOwnerIdNot(ItemStatus itemStatus, UUID currentUserId);
}