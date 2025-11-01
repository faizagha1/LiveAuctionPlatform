package com.liveauction.auction.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ClaimItemRequest(
    
    @NotNull(message = "Item owner ID is required")
    UUID itemOwnerId,
    
    @NotBlank(message = "Please provide a reason for claiming this item")
    String auctioneerMessage
) {}