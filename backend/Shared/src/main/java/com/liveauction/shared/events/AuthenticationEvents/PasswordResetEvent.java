package com.liveauction.shared.events.AuthenticationEvents;

public record PasswordResetEvent(
        String email,
        String token
) {
}
