package com.liveauction.item.dto.request;

import com.liveauction.item.entity.ItemEntity;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateItemRequest(
    @NotBlank(message = "Item name is required")
    @Size(min = 3, max = 200, message = "Name must be between 3 and 200 characters")
    String name,
    
    @NotBlank(message = "Description is required")
    String description,
    
    @NotNull(message = "Category is required")
    ItemEntity.ItemCategory category,
    
    @NotNull(message = "Condition is required")
    ItemEntity.ItemCondition condition,
    
    @NotNull(message = "Starting price is required")
    @DecimalMin(value = "0.01", message = "Starting price must be greater than 0")
    BigDecimal startingPrice,
    
    @DecimalMin(value = "0.01", message = "Reserve price must be greater than 0")
    BigDecimal reservePrice,
    
    @NotNull(message = "Bid increment is required")
    @DecimalMin(value = "0.01", message = "Bid increment must be greater than 0")
    BigDecimal bidIncrement
) {}