import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gavel, TrendingUp, Users, Clock, Zap, DollarSign } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import useWebSocket from '../../hooks/useWebSocket';
import { auctionAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

const LiveAuctionPage = () => {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(0);

    const { connected, currentBid, bidHistory, bidderCount, placeBid } = useWebSocket(auctionId);

    useEffect(() => {
        fetchAuction();
    }, [auctionId]);

    useEffect(() => {
        if (!auction) return;

        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(auction.endTime);
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            setTimeRemaining(diff);

            if (diff === 0) {
                clearInterval(interval);
                toast.info('Auction has ended!');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [auction, toast]); // Added toast

    const fetchAuction = async () => {
        try {
            setLoading(true);
            const response = await auctionAPI.getPublicAuctionDetails(auctionId);
            setAuction(response.data);
            // ⭐️ FIXED: Do not pre-fill bid amount. Let placeholder do the work.
            // setBidAmount(response.data.startingPrice);
        } catch (error) {
            toast.error('Failed to load auction');
            navigate('/auctions');
        } finally {
            setLoading(false);
        }
    };

    // This function now calculates the *actual* minimum allowed bid
    const getMinBidAmount = () => {
        if (!auction) return 0;

        // If there's a current bid, min is current + increment
        if (currentBid) {
            return currentBid.amount + auction.bidIncrement;
        }

        return auction.startingPrice;
    };

    // This function calculates the *next* auto-bid
    const getQuickBidAmount = () => {
        if (!auction) return 0;

        const base = currentBid ? currentBid.amount : auction.startingPrice;

        // Handle case where startingPrice is the highest bid
        if (currentBid && currentBid.amount < auction.startingPrice) {
            return auction.startingPrice + auction.bidIncrement;
        }

        return base + auction.bidIncrement;
    };

    const handlePlaceBid = () => {
        const amount = parseFloat(bidAmount);

        if (!amount || amount <= 0) {
            toast.error('Please enter a valid bid amount');
            return;
        }

        // ⭐️ FIXED: Validate against the correct minimum bid calculation
        // This logic assumes the *first* bid must be >= startingPrice
        // and subsequent bids must be >= currentBid + increment.
        const minBid = currentBid
            ? currentBid.amount + auction.bidIncrement
            : auction.startingPrice;

        if (amount < minBid) {
            toast.error(`Minimum bid is ${formatPrice(minBid)}`);
            return;
        }

        placeBid(amount);

        // ⭐️ FIXED: Removed optimistic toast.success.
        // The WebSocket hook will show an error toast if the bid is rejected.
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // This check is vital so getQuickBidAmount() doesn't fail
    if (loading || !auction) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Background />
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/auctions')}
                    className="mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Auctions
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-2xl p-8"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2">
                                        {auction.title}
                                    </h1>
                                    <Badge variant="in_auction">
                                        <Zap className="w-4 h-4 mr-1" />
                                        LIVE AUCTION
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm mb-1">Time Remaining</p>
                                    <p className={`text-3xl font-bold ${
                                        timeRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-white'
                                    }`}>
                                        {formatTime(timeRemaining)}
                                    </p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 ${
                                connected ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                <span className={connected ? 'text-green-300' : 'text-red-300'}>
                                    {connected ? 'Connected to live auction' : 'Connecting...'}
                                </span>
                            </div>

                            <div className="glass rounded-2xl p-8 text-center mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
                                <p className="text-white/60 text-sm mb-2 relative z-10">Current Highest Bid</p>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={currentBid?.amount || 'none'}
                                        initial={{ scale: 1.2, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="text-5xl font-bold gradient-text relative z-10"
                                    >
                                        {currentBid ? formatPrice(currentBid.amount) : formatPrice(auction.startingPrice)}
                                    </motion.p>
                                </AnimatePresence>
                                {currentBid && (
                                    <p className="text-white/60 text-sm mt-2 relative z-10">
                                        Bid by {currentBid.bidderId.slice(0, 8)}...
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Your Bid Amount"
                                    name="bidAmount"
                                    type="number"
                                    step="0.01"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={formatPrice(getMinBidAmount())}
                                    icon={DollarSign}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setBidAmount(getQuickBidAmount())}
                                    >
                                        Quick Bid: {formatPrice(getQuickBidAmount())}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handlePlaceBid}
                                        disabled={!connected || timeRemaining === 0}
                                    >
                                        <Gavel className="w-5 h-5" />
                                        Place Bid
                                    </Button>
                                </div>

                                <div className="glass bg-blue-500/10 border-blue-500/30 rounded-xl p-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-300">Reserve Price:</span>
                                        <span className="text-white font-medium">{formatPrice(auction.reservePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-300">Bid Increment:</span>
                                        <span className="text-white font-medium">{formatPrice(auction.bidIncrement)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Auction Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Start Time</p>
                                    <p className="text-white">{new Date(auction.startTime).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm mb-1">End Time</p>
                                    <p className="text-white">{new Date(auction.endTime).toLocaleString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                Live Stats
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 glass rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-400" />
                                        <span className="text-white/60">Active Bidders</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{bidderCount}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 glass rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Gavel className="w-5 h-5 text-green-400" />
                                        <span className="text-white/60">Total Bids</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{bidHistory.length}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 glass rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-yellow-400" />
                                        <span className="text-white/60">Time Left</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">{formatTime(timeRemaining)}</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Bid History</h3>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                <AnimatePresence>
                                    {bidHistory.map((bid, index) => (
                                        <motion.div
                                            key={bid.timestamp}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="glass rounded-xl p-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {formatPrice(bid.amount)}
                                                    </p>
                                                    <p className="text-white/60 text-xs">
                                                        {bid.bidderId.slice(0, 8)}...
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white/60 text-xs">
                                                        {new Date(bid.timestamp).toLocaleTimeString()}
                                                    </p>
                                                    {index === 0 && (
                                                        <Badge variant="in_auction" className="text-xs mt-1">
                                                            LEADING
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {bidHistory.length === 0 && (
                                    <p className="text-center text-white/60 py-8">
                                        No bids yet. Be the first!
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveAuctionPage;