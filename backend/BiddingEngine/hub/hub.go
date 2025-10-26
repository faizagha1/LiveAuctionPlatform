package hub

import (
	"BiddingEngine/messaging"
	"BiddingEngine/models"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	rooms map[string]*models.AuctionRoom
	mutex sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		rooms: make(map[string]*models.AuctionRoom),
	}
}

func (h *Hub) CreateRoom(event models.AuctionStartedEvent) error {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	id := event.AuctionID
	room := models.AuctionRoom{
		ID:               id,
		HighestBid:       event.StartingBid,
		HighestBidderID:  "-1",
		AuctioneerID:     event.AuctioneerID,
		BidIncrement:     event.BidIncrement,
		BiddersInAuction: make(map[string]*websocket.Conn),
		StartTime:        event.StartTime,
		EndTime:          event.EndTime,
		Status:           "PENDING",
		BidHistory:       []models.Bid{},
		Mutex:            sync.RWMutex{},
		BidChannel:       make(chan models.Bid, 100),
	}
	h.rooms[id] = &room
	room.Start(func(completedEvent models.AuctionCompletedEvent) {
		messaging.PublishAuctionCompleted(completedEvent)
	})
	return nil
}

func (h *Hub) FindRoom(id string) (*models.AuctionRoom, bool) {
	h.mutex.RLock() // Read lock
	defer h.mutex.RUnlock()
	room, exists := h.rooms[id]
	return room, exists
}

func (h *Hub) EndRoom(id string) error {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	room, exists := h.rooms[id]
	if !exists {
		return nil
	}
	room.Stop()
	delete(h.rooms, id)
	return nil
}
