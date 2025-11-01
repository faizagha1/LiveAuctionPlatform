package models

import "time"

type BidPlacedMessage struct {
	Type          string    `json:"type"`
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
	Type      string  `json:"type"`
	AuctionID string  `json:"auctionId"`
	WinnerID  string  `json:"winnerId"`
	FinalBid  float64 `json:"finalBid"`
}

type AuctionCancelledMessage struct {
	Type      string `json:"type"` // "AUCTION_CANCELLED"
	AuctionID string `json:"auctionId"`
	Reason    string `json:"reason"`
}

type FrontendBid struct {
	Amount    float64   `json:"amount"`
	BidderID  string    `json:"bidderId"`
	Timestamp time.Time `json:"timestamp"`
}

type AuctionStateMessage struct {
	Type        string        `json:"type"`       // "AUCTION_STATE"
	CurrentBid  *FrontendBid  `json:"currentBid"` // Pointer so it can be null
	BidHistory  []FrontendBid `json:"bidHistory"`
	BidderCount int           `json:"bidderCount"`
}
