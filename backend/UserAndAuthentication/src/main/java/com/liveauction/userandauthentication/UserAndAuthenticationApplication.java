package com.liveauction.userandauthentication;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class UserAndAuthenticationApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserAndAuthenticationApplication.class, args);
    }

}
