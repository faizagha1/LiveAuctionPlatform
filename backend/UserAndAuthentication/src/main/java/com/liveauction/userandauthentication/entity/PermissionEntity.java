package com.liveauction.userandauthentication.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionEntity extends BaseEntity {
    
    @Column(nullable = false, unique = true, length = 100)
    private String name; // e.g., "EDIT_ITEM", "REVIEW_APPLICATIONS"
    
    @Column(length = 255)
    private String description;
}