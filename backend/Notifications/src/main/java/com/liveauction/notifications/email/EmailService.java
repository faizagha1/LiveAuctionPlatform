package com.liveauction.notifications.email;

import com.liveauction.notifications.exceptions.EmailSendException;
import com.liveauction.shared.events.AuthenticationEvents.PasswordResetEvent;
import com.liveauction.shared.events.AuthenticationEvents.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${authentication.base-url}")
    private String authServiceBaseUrl;

    @Value("${app.email.from:noreply@liveauction.com}")
    private String fromEmail;

    /**
     * Send email verification link to new user
     *
     * @param event The UserCreatedEvent payload
     * @throws EmailSendException if the mail sender fails
     */
    public void sendEmailVerification(UserCreatedEvent event) {
        log.info("Preparing email verification for: {}", event.userEmail());

        String verificationUrl = String.format(
                "%s/api/v2/authentication/verify-email?token=%s",
                authServiceBaseUrl,
                event.token()
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(event.userEmail());
        message.setSubject("Welcome to Live Auction! Verify Your Email");
        message.setText(buildEmailVerificationBody(verificationUrl));

        try {
            mailSender.send(message);
            log.info("Email verification sent successfully to: {}", event.userEmail());
        } catch (MailException e) {
            log.error("Failed to send verification email to {}: {}", event.userEmail(), e.getMessage(), e);
            throw new EmailSendException("Failed to send verification email", e);
        }
    }

    /**
     * Send password reset link to user
     *
     * @param event The PasswordResetEvent payload
     * @throws EmailSendException if the mail sender fails
     */
    public void sendPasswordReset(PasswordResetEvent event) {
        log.info("Preparing password reset email for: {}", event.email());

        String resetUrl = String.format(
                "%s/api/v2/authentication/reset-password?token=%s",
                authServiceBaseUrl,
                event.token()
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(event.email());
        message.setSubject("Live Auction - Password Reset Request");
        message.setText(buildPasswordResetBody(resetUrl));

        try {
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", event.email());
        } catch (MailException e) {
            log.error("Failed to send password reset email to {}: {}", event.email(), e.getMessage(), e);
            throw new EmailSendException("Failed to send password reset email", e);
        }
    }

    // ============================================================================
    // EMAIL TEMPLATES
    // NOTE: For a full production system, consider using a templating engine
    // like Thymeleaf or FreeMarker to generate rich HTML emails from templates.
    // ============================================================================

    private String buildEmailVerificationBody(String verificationUrl) {
        return String.format("""
                Welcome to Live Auction!
                
                Thank you for registering with Live Auction Platform. To complete your registration,
                please verify your email address by clicking the link below:
                
                %s
                
                This link will expire in 24 hours.
                
                If you didn't create an account with Live Auction, please ignore this email.
                
                Happy bidding!
                The Live Auction Team
                """, verificationUrl);
    }

    private String buildPasswordResetBody(String resetUrl) {
        return String.format("""
                Password Reset Request
                
                We received a request to reset your password for your Live Auction account.
                
                Click the link below to reset your password:
                
                %s
                
                This link will expire in 15 minutes.
                
                If you didn't request a password reset, please ignore this email and your password
                will remain unchanged. You can also contact support if you have concerns.
                
                Best regards,
                The Live Auction Team
                """, resetUrl);
    }
}