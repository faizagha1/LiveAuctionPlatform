package models

import "time"

type AuctionStartedEvent struct {
	AuctionID    string    `json:"auctionId"`
	ItemID       string    `json:"itemId"`
	AuctioneerID string    `json:"auctioneerId"`
	StartingBid  float64   `json:"startingBid"`
	ReserveBid   float64   `json:"reserveBid"`
	BidIncrement float64   `json:"bidIncrement"`
	StartTime    time.Time `json:"startTime"`
	EndTime      time.Time `json:"endTime"`
}

type AuctionCompletedEvent struct {
	AuctionID        string  `json:"auctionId"`
	WinnerID         string  `json:"winnerId"`
	WinningBidAmount float64 `json:"winningBidAmount"`
}

type AuctionCancelledEvent struct {
	AuctionID string `json:"auctionId"`
	Reason    string `json:"reason"`
}
