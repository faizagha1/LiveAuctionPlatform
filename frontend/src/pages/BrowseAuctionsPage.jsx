import { useEffect, useState } from "react";

function BrowseAuctionsPage({ token, navigate }) {
    const [auctions, setAuctions] = useState([]);
    const [status, setStatus] = useState("ONGOING");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuctions();
    }, [status]);

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8082/api/v1/auctions/by-status/${status}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('BrowseAuctionsPage - fetched auctions:', data.data);
                setAuctions(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch auctions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinOrView = (auction) => {
        console.log('Auction clicked:', auction);
        const auctionId = auction.id || auction.auctionId || auction._id;
        console.log('Resolved auctionId:', auctionId);

        if (!auctionId) {
            alert('Cannot join: auction ID is missing');
            return;
        }

        localStorage.setItem("auctionId", auctionId);
        navigate("live-auction", { auctionId });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Auctions</h1>

            <div className="mb-6 flex gap-2">
                {["ONGOING", "SCHEDULED", "COMPLETED"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-4 py-2 rounded-md font-medium ${
                            status === s
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : auctions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600">No {status.toLowerCase()} auctions found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {auctions.map((auction, idx) => (
                        <div
                            key={auction.id || auction.auctionId || idx}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{auction.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Ends: {new Date(auction.endTime).toLocaleString()}
                                </p>
                                <button
                                    onClick={() => handleJoinOrView(auction)}
                                    className={`w-full px-4 py-2 rounded-md font-medium ${
                                        status === "ONGOING"
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {status === "ONGOING" ? "🔴 Join Live" : "View Details"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BrowseAuctionsPage;