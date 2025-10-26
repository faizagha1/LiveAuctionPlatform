import {useEffect, useState} from "react";

function ItemDetailsPage({ token, navigate, itemId }) {
    const [item, setItem] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimsLoading, setClaimsLoading] = useState(false);
    const [showClaims, setShowClaims] = useState(false);
    const [reviewingClaimId, setReviewingClaimId] = useState(null);

    useEffect(() => {
        fetchItem();
    }, [itemId]);

    const fetchItem = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/v1/items/my-items/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setItem(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch item:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClaims = async () => {
        setClaimsLoading(true);
        try {
            const response = await fetch(`http://localhost:8082/api/v1/auctions/claims/item/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setClaims(data.data || []);
                setShowClaims(true);
            }
        } catch (error) {
            console.error('Failed to fetch claims:', error);
            alert('Failed to load claims');
        } finally {
            setClaimsLoading(false);
        }
    };

    const handleToggleClaims = () => {
        if (!showClaims && claims.length === 0) {
            fetchClaims();
        } else {
            setShowClaims(!showClaims);
        }
    };

    const handleReviewClaim = async (claimId, approve) => {
        const action = approve ? 'approve' : 'reject';
        const message = prompt(`Enter a message for the auctioneer (${action}):`);

        if (message === null) return; // User cancelled

        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        setReviewingClaimId(claimId);

        try {
            const response = await fetch(`http://localhost:8082/api/v1/auctions/claims/${claimId}/review`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    approve: approve,
                    sellerMessage: message
                })
            });

            if (response.ok) {
                alert(`Claim ${approve ? 'approved' : 'rejected'} successfully!`);
                fetchClaims(); // Refresh the claims list
            } else {
                const data = await response.json();
                alert(data.message || `Failed to ${action} claim`);
            }
        } catch (error) {
            console.error('Error reviewing claim:', error);
            alert('Network error. Please try again.');
        } finally {
            setReviewingClaimId(null);
        }
    };

    const getClaimStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!item) {
        return <div className="text-center py-12">Item not found</div>;
    }

    const hasPendingClaims = claims.some(claim => claim.status === 'PENDING');
    const hasApprovedClaim = claims.some(claim => claim.status === 'APPROVED');

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Item Details</h1>
                <button
                    onClick={() => navigate('items')}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                >
                    ← Back
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                item.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    item.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                            }`}>
                                {item.status}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate('edit-item', { itemId: item.id })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        >
                            Edit Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                            <p className="text-gray-900">{item.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Category</h3>
                                <p className="text-gray-900">{item.category}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Condition</h3>
                                <p className="text-gray-900">{item.condition.replace('_', ' ')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Starting Price</h3>
                                <p className="text-2xl font-bold text-gray-900">${item.startingPrice}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Reserve Price</h3>
                                <p className="text-2xl font-bold text-gray-900">${item.reservePrice}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Bid Increment</h3>
                                <p className="text-2xl font-bold text-gray-900">${item.bidIncrement}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Created At</h3>
                            <p className="text-gray-900">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Claims Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Auctioneer Claims</h2>
                            {hasPendingClaims && (
                                <p className="text-sm text-yellow-600 mt-1">
                                    ⚠️ You have pending claims to review
                                </p>
                            )}
                            {hasApprovedClaim && (
                                <p className="text-sm text-green-600 mt-1">
                                    ✓ This item has an approved auctioneer
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleToggleClaims}
                            disabled={claimsLoading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
                        >
                            {claimsLoading ? 'Loading...' : showClaims ? 'Hide Claims' : 'View Claims'}
                        </button>
                    </div>

                    {showClaims && (
                        <div>
                            {claims.length === 0 ? (
                                <div className="text-center py-8 text-gray-600">
                                    No claims yet for this item
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {claims.map((claim) => (
                                        <div
                                            key={claim.claimId}
                                            className={`border rounded-lg p-4 ${
                                                claim.status === 'PENDING'
                                                    ? 'border-yellow-300 bg-yellow-50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        Auctioneer ID: {claim.auctioneerId}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Claimed: {new Date(claim.createdAt).toLocaleString()}
                                                    </p>
                                                    {claim.reviewedAt && (
                                                        <p className="text-sm text-gray-600">
                                                            Reviewed: {new Date(claim.reviewedAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClaimStatusColor(claim.status)}`}>
                                                    {claim.status}
                                                </span>
                                            </div>

                                            {claim.auctioneerMessage && (
                                                <div className="mb-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Auctioneer's Message:</p>
                                                    <p className="text-sm text-gray-900 bg-purple-50 p-3 rounded">
                                                        {claim.auctioneerMessage}
                                                    </p>
                                                </div>
                                            )}

                                            {claim.sellerMessage && (
                                                <div className="mb-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Your Response:</p>
                                                    <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded">
                                                        {claim.sellerMessage}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Review Buttons - Only show for PENDING claims */}
                                            {claim.status === 'PENDING' && (
                                                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                                                    <button
                                                        onClick={() => handleReviewClaim(claim.claimId, true)}
                                                        disabled={reviewingClaimId === claim.claimId}
                                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                                                    >
                                                        {reviewingClaimId === claim.claimId ? 'Processing...' : '✓ Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviewClaim(claim.claimId, false)}
                                                        disabled={reviewingClaimId === claim.claimId}
                                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                                                    >
                                                        {reviewingClaimId === claim.claimId ? 'Processing...' : '✗ Reject'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemDetailsPage;