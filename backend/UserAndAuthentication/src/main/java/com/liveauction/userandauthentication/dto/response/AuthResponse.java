package com.liveauction.userandauthentication.dto.response;

public record AuthResponse(
    String accessToken,
    String refreshToken
) {}


