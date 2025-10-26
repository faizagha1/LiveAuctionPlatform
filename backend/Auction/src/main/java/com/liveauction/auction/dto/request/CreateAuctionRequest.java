package com.liveauction.auction.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateAuctionRequest(
    @NotBlank(message = "Auction title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    String title,
    
    @NotNull(message = "Starting price is required")
    @DecimalMin(value = "0.01", message = "Starting price must be greater than 0")
    BigDecimal startingPrice,
    
    @DecimalMin(value = "0.01", message = "Reserve price must be greater than 0")
    BigDecimal reservePrice,
    
    @NotNull(message = "Bid increment is required")
    @DecimalMin(value = "0.01", message = "Bid increment must be greater than 0")
    BigDecimal bidIncrement,
    
    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    Instant startTime,
    
    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    Instant endTime
) {}