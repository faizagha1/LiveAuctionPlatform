package com.liveauction.userandauthentication.config;

import com.liveauction.shared.constants.PermissionConstants;
import com.liveauction.shared.constants.RoleConstants;
import com.liveauction.userandauthentication.entity.PermissionEntity;
import com.liveauction.userandauthentication.entity.RoleEntity;
import com.liveauction.userandauthentication.repository.PermissionRepository;
import com.liveauction.userandauthentication.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🌱 Starting database seeding...");

        seedPermissions();
        seedRoles();

        log.info("✅ Database seeding completed!");
    }

    private void seedPermissions() {
        log.info("📝 Seeding permissions...");

        // Item permissions
        createPermissionIfNotExists(PermissionConstants.VIEW_ITEM, "View item details");
        createPermissionIfNotExists(PermissionConstants.EDIT_ITEM, "Edit item details");
        createPermissionIfNotExists(PermissionConstants.DELETE_ITEM, "Delete item");
        createPermissionIfNotExists(PermissionConstants.SUBMIT_ITEM, "Submit item for review");
        createPermissionIfNotExists(PermissionConstants.CLAIM_ITEM, "Claim item for auction");
        // Auction permissions
        createPermissionIfNotExists(PermissionConstants.CREATE_AUCTION, "Create new auction");
        createPermissionIfNotExists(PermissionConstants.VIEW_AUCTION, "View auction details");
        createPermissionIfNotExists(PermissionConstants.EDIT_AUCTION, "Edit auction details");
        createPermissionIfNotExists(PermissionConstants.CANCEL_AUCTION, "Cancel auction");

        // Admin permissions
        createPermissionIfNotExists(PermissionConstants.REVIEW_ITEMS, "Review submitted items");
        createPermissionIfNotExists(PermissionConstants.REVIEW_APPLICATIONS, "Review auctioneer applications");
        createPermissionIfNotExists(PermissionConstants.MANAGE_USERS, "Manage user accounts");
    }

    private void seedRoles() {
        log.info("👥 Seeding roles...");

        // ROLE_USER - Basic authenticated user
        createRoleIfNotExists(
                RoleConstants.ROLE_USER,
                "Basic user role",
                Set.of(
                        PermissionConstants.VIEW_ITEM,
                        PermissionConstants.VIEW_AUCTION
                )
        );

        // ROLE_SELLER - Can create and manage items
        createRoleIfNotExists(
                RoleConstants.ROLE_SELLER,
                "Can create and sell items",
                Set.of(
                        PermissionConstants.VIEW_ITEM,
                        PermissionConstants.EDIT_ITEM,
                        PermissionConstants.DELETE_ITEM,
                        PermissionConstants.SUBMIT_ITEM,
                        PermissionConstants.VIEW_AUCTION
                )
        );

        // ROLE_AUCTIONEER - Can claim items and create auctions
        createRoleIfNotExists(
                RoleConstants.ROLE_AUCTIONEER,
                "Can conduct auctions",
                Set.of(
                        PermissionConstants.VIEW_ITEM,
                        PermissionConstants.CLAIM_ITEM,
                        PermissionConstants.CREATE_AUCTION,
                        PermissionConstants.VIEW_AUCTION,
                        PermissionConstants.EDIT_AUCTION,
                        PermissionConstants.CANCEL_AUCTION
                )
        );

        // ROLE_ADMIN - Full system access
        createRoleIfNotExists(
                RoleConstants.ROLE_ADMIN,
                "System administrator",
                Set.of(
                        PermissionConstants.VIEW_ITEM,
                        PermissionConstants.EDIT_ITEM,
                        PermissionConstants.DELETE_ITEM,
                        PermissionConstants.SUBMIT_ITEM,
                        PermissionConstants.CLAIM_ITEM, // Added CLAIM_ITEM to admin
                        PermissionConstants.CREATE_AUCTION, // Added CREATE_AUCTION to admin
                        PermissionConstants.VIEW_AUCTION,
                        PermissionConstants.EDIT_AUCTION,
                        PermissionConstants.CANCEL_AUCTION,
                        PermissionConstants.REVIEW_ITEMS,
                        PermissionConstants.REVIEW_APPLICATIONS,
                        PermissionConstants.MANAGE_USERS
                )
        );
    }

    private void createPermissionIfNotExists(String name, String description) {
        if (permissionRepository.findByName(name).isEmpty()) {
            PermissionEntity permission = PermissionEntity.builder()
                    .name(name)
                    .description(description)
                    .build();
            permissionRepository.save(permission);
            log.info("  ✓ Created permission: {}", name);
        } else {
            log.debug("  ⊙ Permission already exists: {}", name);
        }
    }

    private void createRoleIfNotExists(String name, String description, Set<String> permissionNames) {
        if (roleRepository.findByName(name).isEmpty()) {
            Set<PermissionEntity> permissions = permissionNames.stream()
                    .map(permName -> permissionRepository.findByName(permName)
                            .orElseThrow(() -> new RuntimeException("CRITICAL: Seeding failed. Permission not found: " + permName)))
                    .collect(Collectors.toSet());

            RoleEntity role = RoleEntity.builder()
                    .name(name)
                    .description(description)
                    .permissions(permissions)
                    .build();
            roleRepository.save(role);
            log.info("  ✓ Created role: {} with {} permissions", name, permissions.size());
        } else {
            log.debug("  ⊙ Role already exists: {}", name);
        }
    }
}