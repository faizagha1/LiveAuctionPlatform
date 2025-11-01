package com.liveauction.notifications.exceptions;

import org.springframework.mail.MailException;

public class EmailSendException extends RuntimeException {
    public EmailSendException(String message, MailException cause) {
        super(message, cause);
    }
}