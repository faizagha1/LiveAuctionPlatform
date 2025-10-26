package com.liveauction.auction.dto.request;

import jakarta.validation.constraints.*;

import java.time.Instant;

public record UpdateAuctionRequest(
    @NotBlank(message = "Auction title is required")
    String title,
    
    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    Instant startTime,
    
    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    Instant endTime
) {}