package com.liveauction.userandauthentication.dto.request;

public record AuctioneerApplicationRequest(
        String userId,
        String username,
        String email,
        String reason
) {
}
