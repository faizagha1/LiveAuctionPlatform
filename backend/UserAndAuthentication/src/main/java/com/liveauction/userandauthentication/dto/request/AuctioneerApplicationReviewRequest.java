package com.liveauction.userandauthentication.dto.request;

import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationReviewResponseEnum;

public record AuctioneerApplicationReviewRequest(
        AuctioneerApplicationReviewResponseEnum response,
        String comment
) {
}
