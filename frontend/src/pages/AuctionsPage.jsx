import { useEffect, useState } from "react";

function AuctionsPage({ token, navigate }) {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        try {
            const response = await fetch('http://localhost:8082/api/v2/auctions/my-auctions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('fetchAuctions response.data:', data.data);

                // Normalize: ensure `id` exists so UI code can always use `auction.id`
                const normalized = (data.data || []).map(a => ({
                    ...a,
                    id: a.id ?? a.auctionId ?? a._id ?? null
                }));

                setAuctions(normalized);
            } else {
                console.warn('fetchAuctions non-ok response', response.status);
                setAuctions([]);
            }
        } catch (error) {
            console.error('Failed to fetch auctions:', error);
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Auctions</h1>

            {auctions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600 mb-4">No auctions created yet</p>
                    <button
                        onClick={() => navigate('claims')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                        View Your Claims
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {auctions.map((auction, idx) => {
                        const id = auction.id;
                        return (
                            <div key={id ?? idx} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{auction.title}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            auction.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                                                auction.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                    auction.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                        }`}>
                      {auction.status}
                    </span>
                                    </div>

                                    <div className="space-y-1 text-sm mb-4">
                                        <p className="text-gray-700">Starting Price: <span className="font-semibold">${auction.startingPrice}</span></p>
                                        <p className="text-gray-700">Start: {new Date(auction.startTime).toLocaleString()}</p>
                                        <p className="text-gray-700">End: {new Date(auction.endTime).toLocaleString()}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            console.log('navigate -> auction-details, resolved id:', id, 'auction object:', auction);
                                            if (!id) {
                                                alert('Cannot open details: auction id is missing. Check console for auction object.');
                                                return;
                                            }
                                            navigate('auction-details', { auctionId: id });
                                        }}
                                        className={`w-full px-4 py-2 ${id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-700 cursor-not-allowed'} rounded-md font-medium`}
                                        disabled={!id}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
export default AuctionsPage;
