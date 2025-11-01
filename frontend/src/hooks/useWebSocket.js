import { useEffect, useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import API_CONFIG from '../lib/api';
import useAuthStore from '../store/authStore';

const useWebSocket = (auctionId) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [currentBid, setCurrentBid] = useState(null);
    const [bidHistory, setBidHistory] = useState([]);
    const [bidderCount, setBidderCount] = useState(0);
    const toast = useToast();

    const token = useAuthStore((state) => state.accessToken);

    useEffect(() => {
        if (!auctionId || !token) {
            return;
        }

        const wsUrl = `${API_CONFIG.WS_BASE}/auctions/${auctionId}?token=${token}`;

        const newSocket = new WebSocket(wsUrl);

        newSocket.onopen = () => {
            console.log('WebSocket connected');
            setConnected(true);
        };

        newSocket.onclose = () => {
            console.log('WebSocket disconnected');
            setConnected(false);
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            toast.error('Live connection failed.');
        };

        // ⭐️ FIXED: Switched to lowercase 'data.type' and all payload keys
        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.type) { // <-- Use lowercase 'type'

                    // ⭐️ --- START: NEW CASE HANDLER --- ⭐️
                    case 'AUCTION_STATE':
                        // This is the "welcome" message. It sets the entire state.
                        setCurrentBid(data.currentBid); // This will be null if no bids
                        setBidHistory(data.bidHistory);
                        setBidderCount(data.bidderCount);
                        break;
                    // ⭐️ --- END: NEW CASE HANDLER --- ⭐️

                    case 'BID_PLACED':
                        const newBid = {
                            amount: data.newCurrentBid, // <-- Use lowercase 'newCurrentBid'
                            bidderId: data.bidderId,   // <-- Use lowercase 'bidderId'
                            timestamp: data.timestamp, // <-- Use lowercase 'timestamp'
                        };
                        setCurrentBid(newBid);
                        setBidHistory((prev) => [newBid, ...prev].slice(0, 50));
                        // You could also update bidder count here if the backend sends it
                        // if (data.bidderCount) setBidderCount(data.bidderCount);
                        break;
                    case 'BID_REJECTED':
                        toast.error(data.reason); // <-- Use lowercase 'reason'
                        break;
                    case 'AUCTION_ENDED':
                        toast.info(`Auction ended! Winner: ${data.winnerId.slice(0, 8)}... with ${data.finalBid}`);
                        setConnected(false);
                        break;
                    default:
                        // This log will no longer fire for valid messages
                        console.warn('Unknown WS message type:', data.type);
                }
            } catch (error) {
                console.error('Failed to parse WS message:', event.data, error);
            }
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
        // ⭐️ --- THE FIX --- ⭐️
        // 'toast' was removed from this array. It's an unstable dependency
        // because useToast() creates a new function on every render.
        // This was causing the connect/disconnect loop.
    }, [auctionId, token]);

    const placeBid = useCallback((amount) => {
        if (socket && connected && socket.readyState === WebSocket.OPEN) {

            socket.send(JSON.stringify({
                "type": "PLACE_BID",
                "bidAmount": parseFloat(amount)
            }));

        } else {
            console.error('Cannot place bid: WebSocket is not connected.');
            toast.error('Not connected to auction.');
        }
    }, [socket, connected, toast]);

    return {
        connected,
        currentBid,
        bidHistory,
        bidderCount,
        placeBid,
    };
};

export default useWebSocket;