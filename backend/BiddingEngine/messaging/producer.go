package messaging

import (
	"BiddingEngine/models"
	"encoding/json"
	"log"

	"github.com/streadway/amqp"
)

var producerChannel *amqp.Channel

// InitProducer sets up the RabbitMQ producer
func InitProducer() error {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		return err
	}

	ch, err := conn.Channel()
	if err != nil {
		return err
	}

	producerChannel = ch

	// Declare the queue for completed auctions
	_, err = ch.QueueDeclare(
		"auction.completed", // queue name
		true,                // durable
		false,               // delete when unused
		false,               // exclusive
		false,               // no-wait
		nil,                 // arguments
	)

	return err
}

// PublishAuctionCompleted publishes an AuctionCompletedEvent to RabbitMQ
func PublishAuctionCompleted(event models.AuctionCompletedEvent) error {
	body, err := json.Marshal(event)
	if err != nil {
		log.Printf("Error marshaling event: %v", err)
		return err
	}

	err = producerChannel.Publish(
		"",                  // exchange
		"auction.completed", // routing key (queue name)
		false,               // mandatory
		false,               // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)

	if err != nil {
		log.Printf("Error publishing event: %v", err)
		return err
	}

	log.Printf("Published AuctionCompletedEvent for auction %s", event.AuctionID)
	return nil
}
