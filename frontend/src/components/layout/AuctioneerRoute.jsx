// src/components/layout/AuctioneerRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuctioneerRoute = ({ children }) => {
    const location = useLocation();

    // --- THE FIX ---
    // Select each piece of state individually.
    // This is stable and will not cause an infinite loop.
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    // --- END FIX ---

    // 1. If not authenticated at all, send to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. If authenticated, check for auctioneer role
    const isAuctioneer = user?.roles?.includes('ROLE_AUCTIONEER');

    if (!isAuctioneer) {
        // 3. If not an auctioneer, redirect to the apply page with a message
        return (
            <Navigate
                to="/auctioneer/apply"
                state={{
                    message:
                        'You must be an approved auctioneer to access this page. Please apply below.',
                }}
                replace
            />
        );
    }

    // 4. If authenticated AND an auctioneer, show the page
    return children;
};

export default AuctioneerRoute;