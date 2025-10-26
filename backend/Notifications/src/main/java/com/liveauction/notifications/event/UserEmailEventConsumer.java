package com.liveauction.notifications.event;

import com.liveauction.notifications.email.EmailSender;
import com.liveauction.shared.events.AuthenticationEvents.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Slf4j
@Component
@RequiredArgsConstructor

public class UserEmailEventConsumer {
    private final EmailSender emailSender;

    @Bean
    public Consumer<UserCreatedEvent> handleUserEvent(){
        log.info("Starting user event consumer");
        return event -> {
            log.info("User created event received: {}", event);
            emailSender.sendEmailVerification(event);
        };
    }
}
