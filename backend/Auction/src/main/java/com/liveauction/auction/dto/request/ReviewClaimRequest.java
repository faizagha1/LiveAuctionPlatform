package com.liveauction.auction.dto.request;

import jakarta.validation.constraints.NotNull;

public record ReviewClaimRequest(
    @NotNull(message = "Decision is required")
    Boolean approve, // true = approve, false = reject
    
    String sellerMessage // Optional message from seller
) {}