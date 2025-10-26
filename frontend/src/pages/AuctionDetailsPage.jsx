import { useEffect, useState } from "react";

function AuctionDetailsPage({ token, navigate, auctionId }) {
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!auctionId) {
            setError("Missing auction id");
            setLoading(false);
            return;
        }
        fetchAuction();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auctionId]);

    const fetchAuction = async () => {
        setLoading(true);
        setError("");
        const safeId = encodeURIComponent(auctionId);
        const url = `http://localhost:8082/api/v2/auctions/${safeId}`;
        console.log("GET", url);
        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                let msg = response.statusText || `HTTP ${response.status}`;
                try {
                    const data = await response.json();
                    msg = data.message || msg;
                } catch (_) {}
                setError(`Failed to load auction: ${msg}`);
                setAuction(null);
                return;
            }

            const data = await response.json();
            setAuction(data.data);
        } catch (err) {
            console.error("Failed to fetch auction:", err);
            setError("Network error while fetching auction");
            setAuction(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (error) return (
        <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => navigate('auctions')} className="px-4 py-2 bg-blue-600 text-white rounded-md">Back</button>
        </div>
    );
    if (!auction) return <div className="text-center py-12">Auction not found</div>;

    const canCancel = auction.status === "SCHEDULED";
    const isOngoing = auction.status === "ONGOING";

    return (
        <div className="max-w-4xl mx-auto">
            {/* ...same UI as before... */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{auction.title}</h2>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                auction.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                                    auction.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                        auction.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                            }`}>
                {auction.status}
              </span>
                        </div>
                    </div>

                    {/* prices/times */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Starting Price</h3>
                                <p className="text-2xl font-bold text-gray-900">${auction.startingPrice}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Reserve Price</h3>
                                <p className="text-2xl font-bold text-gray-900">${auction.reservePrice}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Bid Increment</h3>
                                <p className="text-2xl font-bold text-gray-900">${auction.bidIncrement}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Start Time</h3>
                                    <p className="text-gray-900">{new Date(auction.startTime).toLocaleString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">End Time</h3>
                                    <p className="text-gray-900">{new Date(auction.endTime).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Created At</h3>
                            <p className="text-gray-900">{new Date(auction.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                        {isOngoing && auction.id && (
                            <button onClick={() => navigate('live-auction', { auctionId: auction.id })}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">
                                🔴 Join Live Auction
                            </button>
                        )}
                        {canCancel && (
                            <button onClick={async () => { /* cancel handler — keep your existing cancel implementation */ }}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">
                                Cancel Auction
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuctionDetailsPage;
