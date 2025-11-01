import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import useAuthStore from './store/authStore';
import useRefreshToken from './hooks/useRefreshToken';
import RoleGuard from './components/layout/RoleGuard';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard
import DashboardPage from './pages/DashboardPage';

// Seller Pages
import MyItemsPage from './pages/seller/MyItemsPage';
import CreateItemPage from './pages/seller/CreateItemPage';
import ItemClaimsPage from './pages/seller/ItemClaimsPage';

// Auctioneer Pages
import AuctioneerApplicationPage from './pages/auctioneer/AuctioneerApplicationPage';
import ClaimMarketplacePage from './pages/auctioneer/ClaimMarketplacePage';
import MyClaimsPage from './pages/auctioneer/MyClaimsPage';
import CreateAuctionPage from './pages/auctioneer/CreateAuctionPage';
import MyAuctionsPage from './pages/auctioneer/MyAuctionsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ItemReviewPage from './pages/admin/ItemReviewPage';
import AuctioneerQueuePage from './pages/admin/AuctioneerQueuePage';
import AuctioneerReviewPage from './pages/admin/AuctioneerReviewPage';

// Buyer Pages
import BrowseAuctionsPage from './pages/buyer/BrowseAuctionsPage';
import LiveAuctionPage from './pages/buyer/LiveAuctionPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public Only Route (redirect to dashboard if authenticated)
const PublicOnlyRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const { hasRole } = useAuthStore();

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Setup token refresh
    useRefreshToken();

    return (
        <BrowserRouter>
            <ToastProvider>
                <Routes>
                    {/* Public Routes (redirect if authenticated) */}
                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <LoginPage />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicOnlyRoute>
                                <RegisterPage />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={
                            <PublicOnlyRoute>
                                <ForgotPasswordPage />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/reset-password"
                        element={
                            <PublicOnlyRoute>
                                <ResetPasswordPage />
                            </PublicOnlyRoute>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Seller Routes */}
                    <Route
                        path="/seller/my-items"
                        element={
                            <ProtectedRoute>
                                {hasRole('ADMIN') ? (
                                    <Navigate to="/admin/dashboard" replace />
                                ) : (
                                    <MyItemsPage />
                                )}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/seller/create-item"
                        element={
                            <ProtectedRoute>
                                {hasRole('ADMIN') ? (
                                    <Navigate to="/admin/dashboard" replace />
                                ) : (
                                    <CreateItemPage />
                                )}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/seller/edit-item/:itemId"
                        element={
                            <ProtectedRoute>
                                {hasRole('ADMIN') ? (
                                    <Navigate to="/admin/dashboard" replace />
                                ) : (
                                    <CreateItemPage />
                                )}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/seller/item-claims/:itemId"
                        element={
                            <ProtectedRoute>
                                {hasRole('ADMIN') ? (
                                    <Navigate to="/admin/dashboard" replace />
                                ) : (
                                    <ItemClaimsPage />
                                )}
                            </ProtectedRoute>
                        }
                    />

                    {/* Auctioneer Routes - With Role Guard */}
                    <Route
                        path="/auctioneer/apply"
                        element={
                            <ProtectedRoute>
                                {hasRole('ADMIN') ? (
                                    <Navigate to="/admin/dashboard" replace />
                                ) : (
                                    <AuctioneerApplicationPage />
                                )}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/auctioneer/marketplace"
                        element={
                            <ProtectedRoute>
                                <RoleGuard requiredRole="AUCTIONEER">
                                    <ClaimMarketplacePage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/auctioneer/my-claims"
                        element={
                            <ProtectedRoute>
                                <RoleGuard requiredRole="AUCTIONEER">
                                    <MyClaimsPage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/auctioneer/create-auction/:claimId/:itemId"
                        element={
                            <ProtectedRoute>
                                <RoleGuard requiredRole="AUCTIONEER">
                                    <CreateAuctionPage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/auctioneer/my-auctions"
                        element={
                            <ProtectedRoute>
                                <RoleGuard requiredRole="AUCTIONEER">
                                    <MyAuctionsPage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes - With Role Guard */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute>
                                <RoleGuard requiredRole="ADMIN" redirectTo="/dashboard">
                                    <AdminDashboard />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/items"
                        element={
                            <ProtectedRoute>
                                <RoleGuard requiredRole="ADMIN" redirectTo="/dashboard">
                                    <ItemReviewPage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/applications"
                        element={
                            <ProtectedRoute>
                                <RoleGuard requiredRole="ADMIN" redirectTo="/dashboard">
                                    <AuctioneerQueuePage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/applications/:applicationId"
                        element={
                            <ProtectedRoute>
                                <RoleGuard requiredRole="ADMIN" redirectTo="/dashboard">
                                    <AuctioneerReviewPage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />

                    {/* Buyer Routes */}
                    <Route
                        path="/auctions"
                        element={
                            <ProtectedRoute>
                                {hasRole('ADMIN') ? (
                                    <Navigate to="/admin/dashboard" replace />
                                ) : (
                                    <BrowseAuctionsPage />
                                )}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/auction/:auctionId/live"
                        element={
                            <ProtectedRoute>
                                {hasRole('ADMIN') ? (
                                    <Navigate to="/admin/dashboard" replace />
                                ) : (
                                    <LiveAuctionPage />
                                )}
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* 404 - Redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;