
import { useEffect, useState, useRef } from "react";

function LiveAuctionPage({ token, navigate, auctionId }) {
    const id = auctionId || localStorage.getItem("auctionId");
    const hasConnected = useRef(false);

    const [auction, setAuction] = useState(null);
    const [currentBid, setCurrentBid] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [ws, setWs] = useState(null);
    const [bidHistory, setBidHistory] = useState([]);
    const [connected, setConnected] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);

    useEffect(() => {
        if (!id) {
            navigate("browse-auctions");
            return;
        }
        fetchAuctionDetails(id);
        fetchCurrentBid(id);
        fetchBidHistory(id);
    }, [id]);

    const fetchAuctionDetails = async (auctionIdToFetch) => {
        try {
            const response = await fetch(
                `http://localhost:8082/api/v1/auctions/${auctionIdToFetch}/public`
            );
            if (response.ok) {
                const data = await response.json();
                setAuction(data.data);
            }
        } catch (err) {
            console.error("Auction fetch error:", err);
        }
    };

    const fetchCurrentBid = async (auctionIdToFetch) => {
        try {
            const url = `http://localhost:8084/api/v1/auctions/${auctionIdToFetch}/current-bid`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                console.log('Current bid data:', data);
                setCurrentBid(data);
                setTimeRemaining(data.timeRemaining);
            }
        } catch (err) {
            console.error("Current bid fetch error:", err);
        }
    };

    const fetchBidHistory = async (auctionIdToFetch) => {
        try {
            const url = `http://localhost:8084/api/v1/auctions/${auctionIdToFetch}/bids`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                console.log('Bid history data:', data);

                if (data.bids && data.bids.length > 0) {
                    const historicalBids = data.bids.map((bid, index) => ({
                        id: `history-${index}-${bid.BidPlacedAt}`,
                        type: "bid",
                        message: "Bid placed",
                        amount: bid.BidAmount,
                        bidderId: bid.BidPlacedById ? bid.BidPlacedById.substring(0, 8) : null,
                        bidderUsername: bid.BidPlacedByUsername,
                        timestamp: new Date(bid.BidPlacedAt)
                    })).reverse();

                    setBidHistory(historicalBids);
                    showConnectionStatus(`Loaded ${data.totalBids} previous bids`, 'info');
                }
            }
        } catch (err) {
            console.error("Bid history fetch error:", err);
        }
    };

    const showConnectionStatus = (message, type) => {
        setConnectionStatus({ message, type });
        setTimeout(() => setConnectionStatus(null), 3000);
    };

    useEffect(() => {
        if (auction && auction.status === "ONGOING" && !hasConnected.current) {
            hasConnected.current = true;
            connectWebSocket(id);
        }

        return () => {
            if (ws) {
                ws.close();
                hasConnected.current = false;
            }
        };
    }, [auction]);

    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const connectWebSocket = (auctionIdToConnect) => {
        const socket = new WebSocket(
            `ws://localhost:8084/ws/auctions/${auctionIdToConnect}?token=${token}`
        );

        socket.onopen = () => {
            setConnected(true);
            showConnectionStatus("✅ Connected to live auction", "success");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);

            if (data.type === "BID_PLACED") {
                const amount = data.newCurrentBid;
                const bidderId = data.bidderId;

                setCurrentBid(prev => ({
                    ...prev,
                    currentBid: amount,
                    highestBidder: bidderId,
                    numberOfBids: (prev?.numberOfBids || 0) + 1
                }));

                addBidToHistory("bid", `New bid placed`, amount, bidderId);
            } else if (data.type === "BID_REJECTED") {
                showConnectionStatus(`❌ ${data.reason}`, "error");
            } else if (data.type === "AUCTION_ENDED") {
                addBidToHistory("bid", `FINAL BID - Auction ended`, data.finalBid);
                setConnected(false);
                setTimeRemaining(0);
                showConnectionStatus("🏁 Auction has ended", "info");
            } else if (data.type === "AUCTION_CANCELLED") {
                setConnected(false);
                showConnectionStatus(`⚠️ Auction cancelled: ${data.reason}`, "error");
            }
        };

        socket.onclose = () => {
            setConnected(false);
            showConnectionStatus("⚠️ Disconnected from auction", "error");
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            showConnectionStatus("❌ Connection error", "error");
        };

        setWs(socket);
    };

    const addBidToHistory = (type, message, amount, bidderId = null) => {
        const entry = {
            id: Date.now() + Math.random(),
            type,
            message,
            amount,
            bidderId: bidderId ? bidderId.substring(0, 8) : null,
            timestamp: new Date()
        };
        setBidHistory(prev => [entry, ...prev].slice(0, 50));
    };

    const handlePlaceBid = () => {
        if (!ws || !connected) return alert("Not connected!");
        const value = parseFloat(bidAmount);
        if (!value || value <= 0) return alert("Enter valid bid amount");

        const currentAmount = currentBid?.currentBid || auction.startingPrice;
        const minBid = currentAmount + auction.bidIncrement;

        if (value < minBid) {
            return alert(`Bid must be at least $${minBid.toFixed(2)}\n(Current: $${currentAmount} + Increment: $${auction.bidIncrement})`);
        }

        ws.send(JSON.stringify({ type: "PLACE_BID", bidAmount: value }));
        setBidAmount("");
    };

    const formatTime = (seconds) => {
        if (seconds === null || seconds < 0) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!auction || currentBid === null) {
        return <div className="p-8 text-center">Loading auction…</div>;
    }

    const suggestedBid = (currentBid?.currentBid || auction.startingPrice) + auction.bidIncrement;
    const totalBids = currentBid?.numberOfBids || 0;

    return (
        <div className="max-w-7xl mx-auto p-4">
            {connectionStatus && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
                    connectionStatus.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                        connectionStatus.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
                            'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                    <p className="text-sm font-medium">{connectionStatus.message}</p>
                </div>
            )}

            <button
                onClick={() => navigate("browse-auctions")}
                className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
            >
                ← Back to Auctions
            </button>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{auction.title}</h1>
                    {connected && (
                        <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full animate-pulse">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            <span className="text-sm font-semibold">LIVE</span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-600">Status: {auction.status}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-4 shadow-lg">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">CURRENT BID</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    ${(currentBid?.currentBid || auction.startingPrice).toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-gray-600 mb-1">TIME LEFT</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {formatTime(timeRemaining)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-blue-200">
                            <div>
                                <p className="text-xs text-gray-600">Starting</p>
                                <p className="text-sm font-semibold text-gray-800">${auction.startingPrice}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Increment</p>
                                <p className="text-sm font-semibold text-gray-800">${auction.bidIncrement}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Bids</p>
                                <p className="text-sm font-semibold text-blue-600">{totalBids}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Reserve</p>
                                <p className="text-sm font-semibold text-gray-800">${auction.reservePrice || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {auction.status === "ONGOING" && (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Place Your Bid</h3>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        placeholder={`Min: $${suggestedBid.toFixed(2)}`}
                                        className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg focus:border-blue-500 focus:outline-none"
                                        step={auction.bidIncrement}
                                        min={suggestedBid}
                                    />
                                </div>
                                <button
                                    onClick={handlePlaceBid}
                                    disabled={!connected}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    BID NOW
                                </button>
                            </div>
                            {!connected && (
                                <p className="text-xs text-red-600 mt-2">⚠️ Not connected</p>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Details</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-600">Auction ID:</span>
                                <span className="font-mono text-gray-800">{id.substring(0, 12)}...</span>
                            </div>
                            {currentBid?.highestBidder && currentBid.highestBidder !== "-1" && (
                                <div className="flex justify-between py-1 border-b border-gray-100">
                                    <span className="text-gray-600">Leader:</span>
                                    <span className="font-mono text-blue-600">{currentBid.highestBidder.substring(0, 8)}...</span>
                                </div>
                            )}
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-600">Started:</span>
                                <span className="text-gray-800">{new Date(auction.startTime).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-600">Ends:</span>
                                <span className="text-gray-800">{new Date(auction.endTime).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-4">
                        <div className="p-3 border-b border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900">Live Activity</h3>
                            <p className="text-xs text-gray-500">{bidHistory.length} bids</p>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {bidHistory.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <p className="text-sm">No bids yet</p>
                                    <p className="text-xs mt-1">Be the first to bid!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {bidHistory.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="p-3 hover:bg-gray-50 transition-colors bg-green-50"
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-green-500"></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="text-xs font-semibold uppercase text-green-700">
                                                            BID
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {entry.timestamp.toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-700">{entry.message}</p>
                                                    {entry.amount && (
                                                        <p className="text-lg font-bold text-gray-900 mt-0.5">
                                                            ${entry.amount.toFixed(2)}
                                                        </p>
                                                    )}
                                                    {entry.bidderId && (
                                                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                            {entry.bidderUsername || entry.bidderId}...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveAuctionPage;