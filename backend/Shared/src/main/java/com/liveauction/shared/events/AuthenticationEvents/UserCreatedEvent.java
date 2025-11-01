package com.liveauction.shared.events.AuthenticationEvents;

import java.util.UUID;

public record UserCreatedEvent(
        UUID userId,
        String organizationEmail,
        String userEmail,
        String token
) {
}
