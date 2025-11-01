package com.liveauction.userandauthentication.entity;

import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationReviewResponseEnum;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "auctioneer_application_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AuctioneerApplicationReview extends BaseEntity{
    @Column(nullable = false)
    private UUID reviewerId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuctioneerApplicationReviewResponseEnum response;

    private String comment;
}
