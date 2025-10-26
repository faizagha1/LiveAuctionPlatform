package com.liveauction.userandauthentication;

import org.springframework.boot.SpringApplication;

public class TestUserAndAuthenticationApplication {

    public static void main(String[] args) {
        SpringApplication.from(UserAndAuthenticationApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
