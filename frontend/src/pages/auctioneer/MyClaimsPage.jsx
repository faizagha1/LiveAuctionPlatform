import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { useToast } from '../../components/ui/Toast';
import { auctionAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { STATUS_BADGE_VARIANTS } from '../../lib/constants';

const MyClaimsPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const response = await auctionAPI.listAllClaimedItems();
            setClaims(response.data.content || []);
        } catch (error) {
            toast.error('Failed to load claims');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: claims.length,
        pending: claims.filter(c => c.status === 'PENDING').length,
        approved: claims.filter(c => c.status === 'APPROVED').length,
        rejected: claims.filter(c => c.status === 'REJECTED').length,
    };

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">My Claims</h1>
                    <p className="text-white/60">Track your item claims and their status</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Claims"
                        value={stats.total}
                        icon={Package}
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        icon={Clock}
                    />
                    <StatCard
                        title="Approved"
                        value={stats.approved}
                        icon={CheckCircle}
                    />
                    <StatCard
                        title="Rejected"
                        value={stats.rejected}
                        icon={XCircle}
                    />
                </div>

                {/* Claims List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : claims.length === 0 ? (
                    <div className="glass rounded-2xl">
                        <EmptyState
                            icon={Package}
                            title="No claims yet"
                            description="Browse the marketplace and claim items to start auctions"
                            actionLabel="Browse Marketplace"
                            onAction={() => navigate('/auctioneer/marketplace')}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {claims.map((claim, index) => (
                            <motion.div
                                key={claim.claimId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-2xl p-6"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Claim Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">
                                                    Item ID: {claim.itemId}
                                                </h3>
                                                <Badge variant={STATUS_BADGE_VARIANTS[claim.status]}>
                                                    {claim.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Your Message */}
                                        <div className="glass rounded-xl p-4 mb-4">
                                            <p className="text-white/60 text-sm mb-2">Your Message:</p>
                                            <p className="text-white text-sm">
                                                {claim.auctioneerMessage || 'No message provided'}
                                            </p>
                                        </div>

                                        {/* Seller Response */}
                                        {claim.sellerMessage && (
                                            <div className="glass rounded-xl p-4 bg-blue-500/10 border-blue-500/30">
                                                <p className="text-blue-300 text-sm mb-2">Seller's Response:</p>
                                                <p className="text-white text-sm">
                                                    {claim.sellerMessage}
                                                </p>
                                            </div>
                                        )}

                                        {/* Timestamps */}
                                        <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
                                            <span>Claimed: {new Date(claim.claimedAt).toLocaleDateString()}</span>
                                            {claim.reviewedAt && (
                                                <span>Reviewed: {new Date(claim.reviewedAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3 md:w-48">
                                        {claim.status === 'APPROVED' && (
                                            <Button
                                                variant="primary"
                                                onClick={() => navigate(`/auctioneer/create-auction/${claim.claimId}/${claim.itemId}`)}
                                            >
                                                Create Auction
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        )}
                                        {claim.status === 'PENDING' && (
                                            <Button variant="ghost" disabled>
                                                <Clock className="w-5 h-5" />
                                                Awaiting Response
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyClaimsPage;