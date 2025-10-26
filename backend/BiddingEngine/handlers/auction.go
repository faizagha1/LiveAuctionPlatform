package handlers

import (
	"BiddingEngine/hub"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetCurrentBid returns current bid status for an auction
func GetCurrentBid(h *hub.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		auctionId := c.Param("id")

		room, exists := h.FindRoom(auctionId)
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
			return
		}

		room.Mutex.RLock()
		defer room.Mutex.RUnlock()

		timeRemaining := int64(room.EndTime.Sub(time.Now()).Seconds())
		if timeRemaining < 0 {
			timeRemaining = 0
		}

		c.JSON(http.StatusOK, gin.H{
			"auctionId":     room.ID,
			"currentBid":    room.HighestBid,
			"highestBidder": room.HighestBidderID,
			"numberOfBids":  len(room.BidHistory),
			"timeRemaining": timeRemaining,
			"status":        room.Status,
		})
	}
}

// GetBidHistory returns all bids for an auction
func GetBidHistory(h *hub.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		auctionId := c.Param("id")

		room, exists := h.FindRoom(auctionId)
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
			return
		}

		room.Mutex.RLock()
		defer room.Mutex.RUnlock()

		c.JSON(http.StatusOK, gin.H{
			"auctionId": room.ID,
			"bids":      room.BidHistory,
			"totalBids": len(room.BidHistory),
		})
	}
}
