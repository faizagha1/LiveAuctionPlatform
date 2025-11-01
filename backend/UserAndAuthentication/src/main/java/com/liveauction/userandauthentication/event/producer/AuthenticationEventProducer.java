package com.liveauction.userandauthentication.event.producer;

import com.liveauction.shared.events.AuthenticationEvents.PasswordResetEvent;
import com.liveauction.shared.events.AuthenticationEvents.UserCreatedEvent;
import com.liveauction.userandauthentication.exceptions.OperationFailedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthenticationEventProducer {

    private final StreamBridge streamBridge;

    @Value("${app.bindings.user.created}")
    private String userCreatedRoutingKey;

    @Value("${app.bindings.password.reset}")
    private String passwordResetRoutingKey;

    @Value("${app.bindings.event-exchange}")
    private String eventExchange;

    /**
     * Publish user created event
     * Triggers email verification flow
     */
    public void userCreated(UserCreatedEvent event) {
        log.info("Publishing user created event for user: {}", event.userId());

        try {
            Message<UserCreatedEvent> message = MessageBuilder
                    .withPayload(event)
                    .setHeader("routingKey", userCreatedRoutingKey)
                    .build();

            boolean sent = streamBridge.send(eventExchange, message);

            if (sent) {
                log.info("User created event published successfully for user: {}", event.userId());
            } else {
                log.error("Failed to publish user created event for user: {}", event.userId());
                throw new OperationFailedException("Failed to publish user created event");
            }
        } catch (Exception e) {
            log.error("Error publishing user created event for user: {}: {}", event.userId(), e.getMessage(), e);
            throw new OperationFailedException("Failed to publish user created event", e);
        }
    }

    /**
     * Publish password reset event
     * Triggers password reset email flow
     */
    public void passwordResetRequested(PasswordResetEvent event) {
        log.info("Publishing password reset event for email: {}", event.email());

        try {
            Message<PasswordResetEvent> message = MessageBuilder
                    .withPayload(event)
                    .setHeader("routingKey", passwordResetRoutingKey)
                    .build();

            boolean sent = streamBridge.send(eventExchange, message);

            if (sent) {
                log.info("Password reset event published successfully for: {}", event.email());
            } else {
                log.error("Failed to publish password reset event for: {}", event.email());
                throw new OperationFailedException("Failed to publish password reset event");
            }
        } catch (Exception e) {
            log.error("Error publishing password reset event for: {}: {}", event.email(), e.getMessage(), e);
            throw new OperationFailedException("Failed to publish password reset event", e);
        }
    }
}