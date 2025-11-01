package com.liveauction.userandauthentication.dto.response;

import java.time.Instant;

public record AuctioneerApplicationResponse(
        Instant appliedAt,
        String status
) {
}
