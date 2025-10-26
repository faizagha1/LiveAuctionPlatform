package com.liveauction.userandauthentication.event.producer;

import com.liveauction.shared.events.AuthenticationEvents.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor

public class AuthenticationEventProducer {
    private final StreamBridge streamBridge;

    @Value("${app.bindings.user.created}")
    private String userCreatedRoutingKey;

    @Value("${app.bindings.event-exchange}")
    private String exchangeName;

    public void userCreated(UserCreatedEvent event) {
        try {
            Message<UserCreatedEvent> message = MessageBuilder
                    .withPayload(event)
                    .setHeader("routingKey", userCreatedRoutingKey)
                    .build();

            streamBridge.send(exchangeName, message);
        } catch (Exception e) {
            log.error("Failed to send user created event: {}", e.getMessage());
        }
    }
}
