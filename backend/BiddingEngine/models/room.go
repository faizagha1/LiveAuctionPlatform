package models

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type AuctionRoom struct {
	ID               string
	HighestBid       float64
	HighestBidderID  string
	AuctioneerID     string
	BidIncrement     float64
	BiddersInAuction map[string]*websocket.Conn
	StartTime        time.Time
	EndTime          time.Time
	Status           string
	BidHistory       []Bid
	Mutex            sync.RWMutex
	BidChannel       chan Bid
}

func (r *AuctionRoom) Start(onAuctionEnd func(AuctionCompletedEvent)) {
	go func() {
		r.Mutex.Lock()
		r.Status = "ACTIVE"
		r.Mutex.Unlock()

		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case bid := <-r.BidChannel:
				r.Mutex.Lock()

				// Validate: not auctioneer
				if bid.BidPlacedById == r.AuctioneerID {
					r.Mutex.Unlock()
					r.SendToClient(bid.BidPlacedById, BidRejectedMessage{
						Type:      "BID_REJECTED",
						AuctionID: r.ID,
						Reason:    "Self-bidding not allowed",
					})
					continue
				}

				// Validate: bid is high enough
				if bid.BidAmount < r.HighestBid+r.BidIncrement {
					r.Mutex.Unlock()
					r.SendToClient(bid.BidPlacedById, BidRejectedMessage{
						Type:      "BID_REJECTED",
						AuctionID: r.ID,
						Reason:    fmt.Sprintf("Bid too low. Must be at least %.2f", r.HighestBid+r.BidIncrement),
					})
					continue
				}

				// Valid bid - update state
				r.HighestBid = bid.BidAmount
				r.HighestBidderID = bid.BidPlacedById
				r.BidHistory = append(r.BidHistory, bid)

				r.Mutex.Unlock()
				r.BroadcastToAll(BidPlacedMessage{
					Type:          "BID_PLACED",
					AuctionID:     r.ID,
					NewCurrentBid: bid.BidAmount,
					BidderID:      bid.BidPlacedById,
					Timestamp:     bid.BidPlacedAt,
				})

			case <-ticker.C:
				if time.Now().After(r.EndTime) {
					r.Mutex.RLock()
					event := AuctionCompletedEvent{
						AuctionID:        r.ID,
						WinnerID:         r.HighestBidderID,
						WinningBidAmount: r.HighestBid,
					}
					r.Mutex.RUnlock()

					onAuctionEnd(event)

					// Broadcast to WebSocket clients
					r.BroadcastToAll(AuctionEndedMessage{
						Type:      "AUCTION_ENDED",
						AuctionID: r.ID,
						WinnerID:  r.HighestBidderID,
						FinalBid:  r.HighestBid,
					})

					r.Stop()
					return
				}
			}
		}
	}()
}
func (r *AuctionRoom) Stop() {
	r.Mutex.Lock()
	r.Status = "FINISHED"
	r.Mutex.Unlock()

	close(r.BidChannel)
	fmt.Printf("AuctionRoom %s stopped. Winner: %s with bid: %.2f\n",
		r.ID, r.HighestBidderID, r.HighestBid)
}
func (r *AuctionRoom) SendToClient(userId string, message interface{}) {
	r.Mutex.RLock()
	conn, exists := r.BiddersInAuction[userId]
	r.Mutex.RUnlock()

	if !exists {
		return
	}

	err := conn.WriteJSON(message)
	if err != nil {
		log.Printf("Error sending to client %s: %v", userId, err)
	}
}
func (r *AuctionRoom) BroadcastToAll(message interface{}) {
	r.Mutex.RLock()
	defer r.Mutex.RUnlock()
	for userId, conn := range r.BiddersInAuction {
		err := conn.WriteJSON(message)
		if err != nil {
			log.Printf("Error broadcasting to client %s: %v", userId, err)
		}
	}
}
