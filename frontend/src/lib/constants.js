// Item Status
export const ITEM_STATUS = {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    IN_AUCTION: 'IN_AUCTION',
};

// Item Categories
export const ITEM_CATEGORIES = [
    { value: '', label: 'Select a category' },
    { value: 'ELECTRONICS', label: 'Electronics' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'CLOTHING', label: 'Clothing' },
    { value: 'COLLECTIBLES', label: 'Collectibles' },
    { value: 'ART', label: 'Art' },
    { value: 'JEWELRY', label: 'Jewelry' },
    { value: 'BOOKS', label: 'Books' },
    { value: 'SPORTS', label: 'Sports Equipment' },
    { value: 'TOYS', label: 'Toys & Games' },
    { value: 'OTHER', label: 'Other' },
];

// Item Conditions
export const ITEM_CONDITIONS = [
    { value: '', label: 'Select condition' },
    { value: 'NEW', label: 'New' },
    { value: 'LIKE_NEW', label: 'Like New' },
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
];

// Auction Status
export const AUCTION_STATUS = {
    SCHEDULED: 'SCHEDULED',
    ONGOING: 'ONGOING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

// Claim Status
export const CLAIM_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

// Badge variant mapping
export const STATUS_BADGE_VARIANTS = {
    DRAFT: 'draft',
    PENDING_APPROVAL: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_AUCTION: 'in_auction',
    SCHEDULED: 'pending',
    ONGOING: 'in_auction',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
};