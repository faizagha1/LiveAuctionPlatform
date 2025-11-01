package com.liveauction.userandauthentication.dto.response;

import com.liveauction.userandauthentication.entity.AuctioneerApplicationEntity;
import com.liveauction.userandauthentication.entity.AuctioneerApplicationReview;
import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationReviewResponseEnum;

import java.util.UUID;

public record AuctioneerApplicationReviewResponse(
        UUID auctioneerApplicantId,
        UUID auctioneerApplicationReviewerId,
        AuctioneerApplicationReviewResponseEnum response,
        String comment
) {
    public static AuctioneerApplicationReviewResponse fromEntity(AuctioneerApplicationReview reviewEntity, AuctioneerApplicationEntity applicationEntity) {
        return new AuctioneerApplicationReviewResponse(
                applicationEntity.getUserId(),
                reviewEntity.getReviewerId(),
                reviewEntity.getResponse(),
                reviewEntity.getComment()
        );
    }
}
