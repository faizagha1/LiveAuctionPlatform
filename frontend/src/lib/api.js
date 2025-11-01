const API_CONFIG = {
    AUTH_API: 'http://localhost:8080/api/v2',
    ITEM_API: 'http://localhost:8081/api/v2',
    AUCTION_API: 'http://localhost:8082/api/v2',
    BIDDING_API: 'http://localhost:8084/api/v1',
    WS_BASE: 'ws://localhost:8084/ws',
};

export default API_CONFIG;

export const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const apiCall = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
};

// Auth API calls
export const authAPI = {
    register: (data) => apiCall(`${API_CONFIG.AUTH_API}/authentication/register`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }),

    login: (data) => apiCall(`${API_CONFIG.AUTH_API}/authentication/login`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }),

    verifyEmail: (token) => apiCall(`${API_CONFIG.AUTH_API}/authentication/verify-email?token=${token}`, {
        method: 'GET',
    }),

    forgotPassword: (email) => apiCall(`${API_CONFIG.AUTH_API}/authentication/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
    }),

    resetPassword: (token, newPassword) => apiCall(
        `${API_CONFIG.AUTH_API}/authentication/reset-password?token=${token}`, {
            method: 'POST',
            body: JSON.stringify({ newPassword }),
            headers: { 'Content-Type': 'application/json' }
        }),

    refreshToken: (refreshToken) => apiCall(`${API_CONFIG.AUTH_API}/authentication/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
        }
    }),

    getProfile: () => apiCall(`${API_CONFIG.AUTH_API}/users/me`),

    applyForAuctioneer: (data) => apiCall(`${API_CONFIG.AUTH_API}/authentication/apply-for-auctioneer`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Item API calls
export const itemAPI = {
    createItem: (data) => apiCall(`${API_CONFIG.ITEM_API}/items`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    updateItem: (itemId, data) => apiCall(`${API_CONFIG.ITEM_API}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    listMyItems: () => apiCall(`${API_CONFIG.ITEM_API}/items/my-items`),

    getMyItemDetails: (itemId) => apiCall(`${API_CONFIG.ITEM_API}/items/my-items/${itemId}`),

    markForApproval: (itemId) => apiCall(`${API_CONFIG.ITEM_API}/items/my-items/${itemId}/mark-for-approval`, {
        method: 'POST',
    }),

    getPublicItemDetails: (itemId) => apiCall(`${API_CONFIG.ITEM_API}/items/${itemId}`),

    listItemsForClaims: () => apiCall(`${API_CONFIG.ITEM_API}/items/listed-for-claims`),
};

// Admin Item API
export const adminItemAPI = {
    getItemsForReview: () => apiCall(`${API_CONFIG.ITEM_API}/admin/items-for-review`),
    reviewItem: (itemId, reviewData) => apiCall(
        `${API_CONFIG.ITEM_API}/admin/items-for-review/${itemId}/review`, {
            method: 'POST',
            body: JSON.stringify(reviewData),
        }
    ),
};

// Auction API calls
export const auctionAPI = {
    claimItem: (itemId, data) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/${itemId}/claim`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    listClaimsForItem: (itemId) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/claims/item/${itemId}`),

    reviewClaim: (claimId, data) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/claims/${claimId}/review`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    listAllClaimedItems: () => apiCall(`${API_CONFIG.AUCTION_API}/auctions/me/claimed-items`),

    createAuction: (claimId, data) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/claims/${claimId}/create-auction`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    updateAuction: (auctionId, data) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/${auctionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    cancelAuction: (auctionId) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/${auctionId}/cancel`, {
        method: 'PUT',
    }),

    listMyAuctions: () => apiCall(`${API_CONFIG.AUCTION_API}/auctions/my-auctions`),

    getAuctionDetails: (auctionId) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/${auctionId}`),

    getPublicAuctionDetails: (auctionId) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/${auctionId}/public`),

    listAuctionsByStatus: (status) => apiCall(`${API_CONFIG.AUCTION_API}/auctions/by-status/${status}`),
};

// Admin Auth API
export const adminAuthAPI = {
    listAllApplications: () => apiCall(`${API_CONFIG.AUTH_API}/admin/applications`),

    listPendingApplications: () => apiCall(`${API_CONFIG.AUTH_API}/admin/applications/pending-applications`),

    getApplicationDetails: (applicationId) =>
        apiCall(`${API_CONFIG.AUTH_API}/admin/applications/pending-applications/${applicationId}`),

    reviewApplication: (applicationId, data) => apiCall(`${API_CONFIG.AUTH_API}/admin/applications/pending-applications/${applicationId}/review`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};