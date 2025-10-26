package com.liveauction.shared.constants;

public final class PermissionConstants {
    private PermissionConstants() {}

    public static final String VIEW_ITEM = "VIEW_ITEM";
    public static final String CLAIM_ITEM = "CLAIM_ITEM";
    public static final String EDIT_ITEM = "EDIT_ITEM";
    public static final String DELETE_ITEM = "DELETE_ITEM";
    public static final String SUBMIT_ITEM = "SUBMIT_ITEM";

    // Auction permissions
    public static final String CREATE_AUCTION = "CREATE_AUCTION";
    public static final String VIEW_AUCTION = "VIEW_AUCTION";
    public static final String EDIT_AUCTION = "EDIT_AUCTION";
    public static final String CANCEL_AUCTION = "CANCEL_AUCTION";

    // Admin permissions
    public static final String REVIEW_ITEMS = "REVIEW_ITEMS";
    public static final String REVIEW_APPLICATIONS = "REVIEW_APPLICATIONS";
    public static final String MANAGE_USERS = "MANAGE_USERS";
}