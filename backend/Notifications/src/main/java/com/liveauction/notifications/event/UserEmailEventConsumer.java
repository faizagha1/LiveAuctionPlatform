package com.liveauction.notifications.event;

import com.liveauction.notifications.email.EmailService;
import com.liveauction.shared.events.AuthenticationEvents.PasswordResetEvent;
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

    private final EmailService emailService;

    /**
     * Consumer for user created events
     * Sends email verification link
     */
    @Bean
    public Consumer<UserCreatedEvent> userVerificationConsumer() {
        return event -> {
            log.info("📧 [IN] User created event received for email: {}", event.userEmail());

            try {
                emailService.sendEmailVerification(event);
                log.info("✅ [OUT] Email verification sent successfully to: {}", event.userEmail());
            } catch (Exception e) {
                log.error("❌ [FAIL] Failed to process email verification for {}: {}",
                        event.userEmail(), e.getMessage(), e);
                // NOTE: Depending on retry policy, this might throw to trigger a retry.
                // For email, we'll log the error and stop to avoid spamming.
            }
        };
    }

    /**
     * Consumer for password reset events
     * Sends password reset link
     */
    @Bean
    public Consumer<PasswordResetEvent> passwordResetConsumer() {
        return event -> {
            log.info("🔐 [IN] Password reset event received for email: {}", event.email());

            try {
                emailService.sendPasswordReset(event);
                log.info("✅ [OUT] Password reset email sent successfully to: {}", event.email());
            } catch (Exception e) {
                log.error("❌ [FAIL] Failed to send password reset email to {}: {}",
                        event.email(), e.getMessage(), e);
            }
        };
    }
}