package com.liveauction.item.event.producer;

import com.liveauction.item.entity.ItemEntity;
//import com.liveauction.shared.events.ItemEvents;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
//import org.springframework.cloud.stream.function.StreamBridge;
//import org.springframework.messaging.Message;
//import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ItemEventProducer {

//    private final StreamBridge streamBridge;

    @Value("${app.bindings.item.created}")
    private String itemCreatedRoutingKey;

    @Value("${app.bindings.item.updated}")
    private String itemUpdatedRoutingKey;

    @Value("${app.bindings.event-exchange}")
    private String eventExchange;

//    public void itemCreated(ItemEntity item) {
//        var event = new ItemEvents.ItemCreatedEvent(
//                item.getId(),
//                item.getOwnerId(),
//                item.getName(),
//                item.getStartingPrice(),
//                item.getCreatedAt()
//        );
//        log.info("Publishing item created event for item: {}", event.itemId());
//        sendMessage(event, itemCreatedRoutingKey);
//    }
//
//    public void itemUpdated(ItemEntity item) {
//        var event = new ItemEvents.ItemUpdatedEvent(
//                item.getId(),
//                item.getOwnerId(),
//                item.getName(),
//                item.getStartingPrice(),
//                item.getReservePrice()
//        );
//        log.info("Publishing item updated event for item: {}", event.itemId());
//        sendMessage(event, itemUpdatedRoutingKey);
//    }
//
//    private <T> void sendMessage(T payload, String routingKey) {
//        try {
//            Message<T> message = MessageBuilder
//                    .withPayload(payload)
//                    .setHeader("routingKey", routingKey)
//                    .build();
//
//            boolean sent = streamBridge.send(eventExchange, message);
//            if (sent) {
//                log.info("Event published successfully with routingKey: {}", routingKey);
//            } else {
//                log.error("Failed to publish event with routingKey: {}", routingKey);
//            }
//        } catch (Exception e) {
//            log.error("Error publishing event with routingKey {}: {}", routingKey, e.getMessage(), e);
//        }
//    }
}