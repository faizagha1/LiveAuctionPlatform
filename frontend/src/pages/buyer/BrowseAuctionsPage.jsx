import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, Search, Clock, Zap, TrendingUp } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { auctionAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

const BrowseAuctionsPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const response = await auctionAPI.listAuctionsByStatus('ONGOING');
            setAuctions(response.data.content || []);
        } catch (error) {
            toast.error('Failed to load auctions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAuctions = Array.isArray(auctions)
        ? auctions.filter(auction =>
            auction.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const getTimeRemaining = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff < 0) return 'Ended';

        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                            <Gavel className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white">Live Auctions</h1>
                            <p className="text-white/60">Discover and bid on ongoing auctions</p>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 mb-8">
                    <Input
                        placeholder="Search auctions by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={Search}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : filteredAuctions.length === 0 ? (
                    <div className="glass rounded-2xl">
                        <EmptyState
                            icon={Gavel}
                            title="No live auctions"
                            description="Check back later for new auctions"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAuctions.map((auction, index) => (
                            <motion.div
                                key={auction.auctionId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-2xl overflow-hidden group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <Badge variant="in_auction">
                                            <Zap className="w-3 h-3 mr-1" />
                                            LIVE
                                        </Badge>
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs font-medium">
                                                {getTimeRemaining(auction.endTime)}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {auction.title}
                                    </h3>

                                    <div className="glass rounded-xl p-4 mb-4">
                                        <p className="text-white/60 text-xs mb-1">Current Bid</p>
                                        <p className="text-2xl font-bold text-white">
                                            {formatPrice(auction.startingPrice)}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                        <div>
                                            <p className="text-white/60">Increment</p>
                                            <p className="text-white font-medium">
                                                {formatPrice(auction.bidIncrement)}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => navigate(`/auction/${auction.auctionId}/live`)}
                                    >
                                        <Gavel className="w-5 h-5" />
                                        Join Auction
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseAuctionsPage;