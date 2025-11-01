package com.liveauction.auction.event.producer;

import com.liveauction.shared.events.AuctionEvents.AuctionCreatedEvent;
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
public class AuctionEventProducer {
    
    private final StreamBridge streamBridge;

    @Value("${app.bindings.auction.created.routing-key}")
    private String auctionCreatedRoutingKey;

    @Value("${app.bindings.auction-event-exchange}")
    private String auctionChannel;

    public void publishAuctionCreated(AuctionCreatedEvent event) {
        log.info("Publishing auction created event for auction: {}", event.auctionId());
        sendMessage(event, auctionCreatedRoutingKey);
    }
    
    // You can add other event publishing methods here
    // e.g., publishAuctionStarted, publishAuctionEnded

    private <T> void sendMessage(T payload, String routingKey) {
        try {
            Message<T> message = MessageBuilder
                    .withPayload(payload)
                    .setHeader("routingKey", routingKey)
                    .build();

            boolean sent = streamBridge.send(auctionChannel, message);
            if (sent) {
                log.info("Event published successfully with routingKey: {}", routingKey);
            } else {
                log.error("Failed to publish event with routingKey: {}", routingKey);
            }
        } catch (Exception e) {
            log.error("Error publishing event with routingKey {}: {}", routingKey, e.getMessage(), e);
        }
    }
}