package com.liveauction.shared.events.AuthenticationEvents;

public record UserCreatedEvent(
        String organizationEmail,
        String userEmail,
        String token
) {
}
