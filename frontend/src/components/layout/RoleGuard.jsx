import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Gavel, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Navbar from './Navbar';
import Background from './Background';
import Button from '../ui/Button';

const RoleGuard = ({ children, requiredRole, redirectTo = '/dashboard' }) => {
    const { user, hasRole } = useAuthStore();

    // If user has the required role, render children
    if (hasRole(requiredRole)) {
        return children;
    }

    // Special case: If they need AUCTIONEER role, show application prompt
    if (requiredRole === 'AUCTIONEER') {
        return (
            <div className="min-h-screen">
                <Background />
                <Navbar />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-12 text-center"
                    >
                        {/* Icon */}
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50">
                            <Gavel className="w-12 h-12 text-white" />
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Auctioneer Role Required
                        </h1>

                        <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                            To access this feature, you need to become an auctioneer. Apply now and get approved by our admin team to start claiming items and creating auctions!
                        </p>

                        {/* Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="glass rounded-xl p-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                                    <Gavel className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-white font-medium mb-1">Host Auctions</h3>
                                <p className="text-white/60 text-sm">Create and manage exciting auctions</p>
                            </div>

                            <div className="glass rounded-xl p-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                    <Shield className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-white font-medium mb-1">Trusted Platform</h3>
                                <p className="text-white/60 text-sm">Verified auctioneer badge</p>
                            </div>

                            <div className="glass rounded-xl p-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                                    <ArrowRight className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="text-white font-medium mb-1">Quick Approval</h3>
                                <p className="text-white/60 text-sm">Fast review within 24-48 hours</p>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => window.location.href = '/auctioneer/apply'}
                            >
                                Apply for Auctioneer Role
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => window.location.href = redirectTo}
                            >
                                Back to Dashboard
                            </Button>
                        </div>

                        <p className="text-white/40 text-sm mt-8">
                            Already applied? Please wait for admin approval. You'll be notified via email.
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    // For other roles, just redirect
    return <Navigate to={redirectTo} replace />;
};

export default RoleGuard;