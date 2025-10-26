package models

import "time"

type Bid struct {
	BidAmount           float64
	BidPlacedById       string
	BidPlacedByUsername string
	BidPlacedAt         time.Time
}
