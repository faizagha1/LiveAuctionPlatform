package com.liveauction.userandauthentication.repository;

import com.liveauction.userandauthentication.entity.AuctioneerApplicationReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuctioneerApplicationReviewRepository extends JpaRepository<AuctioneerApplicationReview, UUID> {
}
