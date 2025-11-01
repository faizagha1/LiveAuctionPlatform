package com.liveauction.notifications.email;

import com.liveauction.shared.events.AuthenticationEvents.PasswordResetEvent;
import com.liveauction.shared.events.AuthenticationEvents.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor

public class EmailSender {
    private final JavaMailSender javaMailSender;

    @Value("${authentication.base-url}")
    private String authenticationServiceBaseUrl;

    public void sendEmailVerification(UserCreatedEvent event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.userEmail());
        message.setSubject("Welcome to Live Auction!");
        String url = authenticationServiceBaseUrl + "/api/v2/authentication/verify-email?token=" + event.token();
        message.setText("Welcome to Live Auction! Please verify your email by clicking on the link below:\n" + url);

        javaMailSender.send(message);
    }

    public void sendPasswordReset(PasswordResetEvent event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.email());
        message.setSubject("Password reset!");
        String url = authenticationServiceBaseUrl + "/api/v2/authentication/reset-password?token=" + event.token();
        message.setText("Please click the link below to reset your password:\n" + url);

        javaMailSender.send(message);
    }
}
