package models

import "time"

type BidPlacedMessage struct {
	Type          string    `json:"type"` // "BID_PLACED"
	AuctionID     string    `json:"auctionId"`
	NewCurrentBid float64   `json:"newCurrentBid"`
	BidderID      string    `json:"bidderId"`
	Timestamp     time.Time `json:"timestamp"`
}

type BidRejectedMessage struct {
	Type      string `json:"type"`
	AuctionID string `json:"auctionId"`
	Reason    string `json:"reason"`
}

type AuctionEndedMessage struct {
	Type      string  `json:"type"` // "AUCTION_ENDED"
	AuctionID string  `json:"auctionId"`
	WinnerID  string  `json:"winnerId"`
	FinalBid  float64 `json:"finalBid"`
}

type AuctionCancelledMessage struct {
	Type      string `json:"type"` // "AUCTION_CANCELLED"
	AuctionID string `json:"auctionId"`
	Reason    string `json:"reason"`
}
