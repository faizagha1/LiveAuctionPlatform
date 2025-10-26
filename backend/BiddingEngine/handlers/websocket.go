package handlers

import (
	"BiddingEngine/hub"
	"BiddingEngine/models"
	"BiddingEngine/utils"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WebSocketHandler(h *hub.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get auctionId from URL
		auctionId := c.Param("id")

		// 2. Extract JWT token from query parameter
		tokenString := c.Query("token")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			return
		}

		// 3. Validate JWT
		token, err := utils.ValidateJWT(tokenString)
		if err != nil {
			log.Printf("JWT validation failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// 4. Extract userId from token
		userId, err := utils.ExtractUserId(token)
		if err != nil {
			log.Printf("Failed to extract userId: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		// 5. Extract username for display
		username, err := utils.ExtractUsername(token)
		if err != nil {
			log.Printf("Failed to extract username: %v", err)
			username = userId // Fallback to userId if username extraction fails
		}

		// 6. Find the auction room
		room, exists := h.FindRoom(auctionId)
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
			return
		}

		// 7. Upgrade to WebSocket
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Failed to upgrade connection: %v", err)
			return
		}
		defer conn.Close()

		// 8. Register client
		room.Mutex.Lock()
		room.BiddersInAuction[userId] = conn
		room.Mutex.Unlock()

		log.Printf("User %s (%s) connected to auction %s", username, userId, auctionId)

		// 9. Cleanup on disconnect
		defer func() {
			room.Mutex.Lock()
			delete(room.BiddersInAuction, userId)
			room.Mutex.Unlock()
			log.Printf("User %s disconnected from auction %s", userId, auctionId)
		}()

		// 10. Listen for messages
		for {
			var msg map[string]interface{}
			err := conn.ReadJSON(&msg)
			if err != nil {
				log.Printf("Error reading message: %v", err)
				break
			}

			msgType, ok := msg["type"].(string)
			if !ok {
				log.Println("Message missing type field")
				continue
			}

			switch msgType {
			case "PLACE_BID":
				handlePlaceBid(room, userId, username, msg)
			default:
				log.Printf("Unknown message type: %s", msgType)
			}
		}
	}
}

func handlePlaceBid(room *models.AuctionRoom, userId, username string, msg map[string]interface{}) {
	bidAmount, ok := msg["bidAmount"].(float64)
	if !ok {
		log.Println("Invalid bid amount")
		return
	}

	bid := models.Bid{
		BidAmount:           bidAmount,
		BidPlacedById:       userId,
		BidPlacedByUsername: username,
		BidPlacedAt:         time.Now(),
	}

	room.BidChannel <- bid
}
