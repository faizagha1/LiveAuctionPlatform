package models

type PlaceBidRequest struct {
	AuctionID string `json:"auctionId"`
	BidAmount int64  `json:"bidAmount"`
}

type PlaceBidResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	CurrentBid    int64  `json:"currentBid"`
	HighestBidder int64  `json:"highestBidder"`
}

type CurrentBidStatusResponse struct {
	AuctionID     string `json:"auctionId"`
	CurrentBid    int64  `json:"currentBid"`
	HighestBidder int64  `json:"highestBidder"`
	NumberOfBids  int    `json:"numberOfBids"`
	TimeRemaining int64  `json:"timeRemaining"` // seconds
	Status        string `json:"status"`
}
