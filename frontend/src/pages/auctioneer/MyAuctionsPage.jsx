import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, Calendar, Edit, XCircle, Play, CheckCircle } from 'lucide-react';
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

const MyAuctionsPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const response = await auctionAPI.listMyAuctions();
            setAuctions(response.data.content || []);
        } catch (error) {
            toast.error('Failed to load auctions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAuction = async (auctionId) => {
        if (!confirm('Are you sure you want to cancel this auction?')) return;

        try {
            await auctionAPI.cancelAuction(auctionId);
            toast.success('Auction cancelled successfully!');
            fetchAuctions();
        } catch (error) {
            toast.error(error.message || 'Failed to cancel auction');
        }
    };

    const canEditOrCancel = (auction) => {
        if (auction.status !== 'SCHEDULED') return false;
        const now = new Date();
        const start = new Date(auction.startTime);
        const hoursUntilStart = (start - now) / 1000 / 60 / 60;
        return hoursUntilStart > 3;
    };

    const getTimeUntilStart = (startTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const diff = start - now;

        if (diff < 0) return 'Started';

        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `Starts in ${days} day${days > 1 ? 's' : ''}`;
        }
        return `Starts in ${hours}h ${minutes}m`;
    };

    const stats = {
        total: auctions.length,
        scheduled: auctions.filter(a => a.status === 'SCHEDULED').length,
        ongoing: auctions.filter(a => a.status === 'ONGOING').length,
        completed: auctions.filter(a => a.status === 'COMPLETED').length,
    };

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">My Auctions</h1>
                    <p className="text-white/60">Manage your scheduled and ongoing auctions</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Auctions"
                        value={stats.total}
                        icon={Gavel}
                    />
                    <StatCard
                        title="Scheduled"
                        value={stats.scheduled}
                        icon={Calendar}
                    />
                    <StatCard
                        title="Ongoing"
                        value={stats.ongoing}
                        icon={Play}
                    />
                    <StatCard
                        title="Completed"
                        value={stats.completed}
                        icon={CheckCircle}
                    />
                </div>

                {/* Auctions List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="glass rounded-2xl">
                        <EmptyState
                            icon={Gavel}
                            title="No auctions yet"
                            description="Create your first auction from an approved claim"
                            actionLabel="View My Claims"
                            onAction={() => navigate('/auctioneer/my-claims')}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {auctions.map((auction, index) => (
                            <motion.div
                                key={auction.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-2xl p-6"
                            >
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Auction Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">
                                                    {auction.title}
                                                </h3>
                                                <Badge variant={STATUS_BADGE_VARIANTS[auction.status]}>
                                                    {auction.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Auction Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-white/60 text-sm mb-1">Starting Price</p>
                                                <p className="text-lg font-bold text-white">
                                                    {formatPrice(auction.startingPrice)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-white/60 text-sm mb-1">Reserve Price</p>
                                                <p className="text-lg font-bold text-white">
                                                    {formatPrice(auction.reservePrice)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-white/60 text-sm mb-1">Bid Increment</p>
                                                <p className="text-lg font-bold text-white">
                                                    {formatPrice(auction.bidIncrement)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Timing Info */}
                                        <div className="glass rounded-xl p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-white/60 text-sm mb-1">Start Time</p>
                                                    <p className="text-white font-medium">
                                                        {new Date(auction.startTime).toLocaleString()}
                                                    </p>
                                                    {auction.status === 'SCHEDULED' && (
                                                        <p className="text-purple-400 text-sm mt-1">
                                                            {getTimeUntilStart(auction.startTime)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white/60 text-sm mb-1">End Time</p>
                                                    <p className="text-white font-medium">
                                                        {new Date(auction.endTime).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3 lg:w-48">
                                        {auction.status === 'SCHEDULED' && canEditOrCancel(auction) && (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => navigate(`/auctioneer/edit-auction/${auction.id}`)}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleCancelAuction(auction.id)}
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {auction.status === 'SCHEDULED' && !canEditOrCancel(auction) && (
                                            <Button variant="ghost" disabled>
                                                <Calendar className="w-5 h-5" />
                                                Starting Soon
                                            </Button>
                                        )}
                                        {auction.status === 'ONGOING' && (
                                            <Button
                                                variant="primary"
                                                onClick={() => navigate(`/auction/${auction.id}/live`)}
                                            >
                                                <Play className="w-5 h-5" />
                                                View Live
                                            </Button>
                                        )}
                                        {auction.status === 'COMPLETED' && (
                                            <Button variant="ghost" disabled>
                                                <CheckCircle className="w-5 h-5" />
                                                Completed
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

export default MyAuctionsPage;