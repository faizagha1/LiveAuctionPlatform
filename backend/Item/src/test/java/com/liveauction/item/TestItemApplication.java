package com.liveauction.item;

import org.springframework.boot.SpringApplication;

public class TestItemApplication {

    public static void main(String[] args) {
        SpringApplication.from(ItemApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
