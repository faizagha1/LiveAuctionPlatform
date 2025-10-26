package messaging

import (
	"BiddingEngine/models"
	"encoding/json"
	"log"

	"github.com/streadway/amqp"
)

// StartConsumer takes a callback function instead of importing hub
func StartConsumer(createRoom func(models.AuctionStartedEvent) error) {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ:", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal("Failed to open channel:", err)
	}
	defer ch.Close()

	// Declare exchange (must match Spring config)
	err = ch.ExchangeDeclare(
		"resource-events-exchange", // name
		"topic",                    // type
		true,                       // durable
		false,                      // auto-deleted
		false,                      // internal
		false,                      // no-wait
		nil,                        // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare exchange:", err)
	}

	// Declare queue
	q, err := ch.QueueDeclare(
		"auction.created.queue", // queue name
		true,                    // durable
		false,                   // delete when unused
		false,                   // exclusive
		false,                   // no-wait
		nil,                     // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare queue:", err)
	}

	// Bind queue to exchange with routing key
	err = ch.QueueBind(
		q.Name,                     // queue name
		"auction.created",          // routing key
		"resource-events-exchange", // exchange
		false,
		nil,
	)
	if err != nil {
		log.Fatal("Failed to bind queue:", err)
	}

	// Consume messages
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatal("Failed to start consuming:", err)
	}

	log.Println("✅ Consumer listening on auction.created routing key")

	for msg := range msgs {
		var event models.AuctionStartedEvent
		err := json.Unmarshal(msg.Body, &event)
		if err != nil {
			log.Printf("Error unmarshaling event: %v", err)
			continue
		}

		createRoom(event)
		log.Printf("✅ Auction started: %s", event.AuctionID)
	}
}
