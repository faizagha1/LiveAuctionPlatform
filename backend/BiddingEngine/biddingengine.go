package main

import (
	"BiddingEngine/handlers"
	"BiddingEngine/hub"
	"BiddingEngine/messaging"
	"BiddingEngine/utils"
	"fmt"
	"log"
	"time"

	"github.com/gin-contrib/cors" // Add this import
	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("Starting Bidding Engine...")

	// Initialize JWT secret (MUST match your Java secret)
	jwtSecret := "017bcca11f53ca52c3f4d8031c9e0a939e617c9524d26144e9ab9ed1e27c1d40818628c4ef4ae7585f861edb91ca0b2a64923f3139de7b3317c31ca11840bda7"

	utils.InitJWT(jwtSecret)
	fmt.Println("JWT initialized")

	// Initialize Hub
	auctionHub := hub.NewHub()
	fmt.Println("Hub initialized")

	// Initialize RabbitMQ Producer
	err := messaging.InitProducer()
	if err != nil {
		log.Fatal("Failed to initialize producer:", err)
	}
	fmt.Println("RabbitMQ Producer initialized")

	// Start RabbitMQ Consumer
	go messaging.StartConsumer(auctionHub.CreateRoom)
	fmt.Println("RabbitMQ Consumer started")

	// Setup Gin HTTP server
	router := gin.Default()

	// ADD CORS MIDDLEWARE HERE
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check
	router.GET("/health", handlers.HealthCheck)

	// Auction endpoints
	router.GET("/api/v1/auctions/:id/current-bid", handlers.GetCurrentBid(auctionHub))
	router.GET("/api/v1/auctions/:id/bids", handlers.GetBidHistory(auctionHub))

	// WebSocket endpoint
	router.GET("/ws/auctions/:id", handlers.WebSocketHandler(auctionHub))

	// Start server
	fmt.Println("Server starting on :8084")
	log.Fatal(router.Run(":8084"))
}
