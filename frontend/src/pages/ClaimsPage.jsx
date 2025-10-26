import {useEffect, useState} from "react";

function ClaimsPage({ token, navigate, user }) {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const response = await fetch('http://localhost:8082/api/v1/auctions/me/claimed-items', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter to only show APPROVED claims
                setClaims(data.data.filter(claim => claim.status === 'APPROVED'));
            }
        } catch (error) {
            console.error('Failed to fetch claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Approved Claims</h1>

            {claims.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600 mb-4">No approved claims yet</p>
                    <button
                        onClick={() => navigate('browse-items')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
                    >
                        Browse Items to Claim
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {claims.map((claim) => (
                        <div key={claim.claimId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Item Claim</h3>
                                        <p className="text-xs text-gray-500 mt-1">Item ID: {claim.itemId.substring(0, 8)}...</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(claim.status)}`}>
                                        {claim.status}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    {claim.auctioneerMessage && (
                                        <div className="bg-purple-50 p-3 rounded">
                                            <p className="font-medium text-purple-900 mb-1">Your Message:</p>
                                            <p className="text-gray-700">{claim.auctioneerMessage}</p>
                                        </div>
                                    )}

                                    {claim.sellerMessage && (
                                        <div className="bg-blue-50 p-3 rounded">
                                            <p className="font-medium text-blue-900 mb-1">Seller Response:</p>
                                            <p className="text-gray-700">{claim.sellerMessage}</p>
                                        </div>
                                    )}

                                    {claim.createdAt && (
                                        <p className="text-gray-500 text-xs">Claimed: {new Date(claim.createdAt).toLocaleString()}</p>
                                    )}
                                    {claim.reviewedAt && (
                                        <p className="text-gray-500 text-xs">Reviewed: {new Date(claim.reviewedAt).toLocaleString()}</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate('create-auction', { claimId: claim.claimId })}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                                >
                                    Create Auction
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClaimsPage;