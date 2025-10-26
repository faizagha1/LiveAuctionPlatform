package com.liveauction.auction.event.producer;

import com.liveauction.shared.events.AuctionEvents.AuctionCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;
import org.springframework.cloud.stream.function.StreamBridge;

@Component
@RequiredArgsConstructor
public class AuctionCreatedEventProducer {
    private final StreamBridge streamBridge;

    @Value("${app.bindings.auction.created.routing-key}")
    private String auctionCreatedRoutingKey;

    @Value("${app.bindings.auction-event-exchange}")
    private String auctionChannel;

    public void auctionCreated(AuctionCreatedEvent auctionCreatedEvent) {
        Message<AuctionCreatedEvent> message = MessageBuilder
                .withPayload(auctionCreatedEvent)
                .setHeader("routingKey", auctionCreatedRoutingKey)
                .build();
        streamBridge.send(auctionChannel, message);
    }

}
