package com.liveauction.shared.constants;

public final class RoleConstants {
    private RoleConstants() {} // Prevent instantiation
    
    // Global roles
    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_SELLER = "ROLE_SELLER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_AUCTIONEER = "ROLE_AUCTIONEER";
    
    // Resource-specific roles
    public static final String ROLE_ITEM_OWNER = "ROLE_ITEM_OWNER";
    public static final String ROLE_AUCTION_OWNER = "ROLE_AUCTION_OWNER";
    
    // Resource types
    public static final String RESOURCE_TYPE_ITEM = "ITEM";
    public static final String RESOURCE_TYPE_AUCTION = "AUCTION";
}