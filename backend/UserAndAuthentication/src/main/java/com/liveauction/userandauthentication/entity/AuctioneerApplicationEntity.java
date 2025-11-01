package com.liveauction.userandauthentication.entity;

import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auctioneer_application")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctioneerApplicationEntity extends BaseEntity {
    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctioneerApplicationStatus status;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private Instant appliedAt;

}