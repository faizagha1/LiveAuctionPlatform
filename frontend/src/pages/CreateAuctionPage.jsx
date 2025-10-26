import { useEffect, useState } from "react";

function CreateAuctionPage({ token, navigate, claimId }) {
    const [claim, setClaim] = useState(null);
    const [itemDetails, setItemDetails] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
    });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('ClaimId received:', claimId);
        if (claimId) {
            fetchClaimAndItem();
        } else {
            console.error('No claimId provided!');
            setError('No claim ID provided');
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claimId]);

    const fetchClaimAndItem = async () => {
        try {
            // Fetch all approved claims for the current auctioneer
            const claimResponse = await fetch(`http://localhost:8082/api/v1/auctions/me/claimed-items`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (claimResponse.ok) {
                const claimData = await claimResponse.json();
                // Find the specific approved claim
                const foundClaim = claimData.data.find(c => c.claimId === claimId && c.status === 'APPROVED');

                if (!foundClaim) {
                    setError('Claim not found or not approved');
                    setLoading(false);
                    return;
                }

                setClaim(foundClaim);

                // Fetch the public item details from the item service
                const itemResponse = await fetch(`http://localhost:8081/api/v1/items/${foundClaim.itemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (itemResponse.ok) {
                    const itemData = await itemResponse.json();
                    setItemDetails(itemData.data);
                    setFormData(prev => ({
                        ...prev,
                        title: `Auction: ${itemData.data.name}`
                    }));
                } else {
                    setError('Failed to fetch item details');
                }
            } else {
                setError('Failed to fetch claim details');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError('Network error while loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        // Combine date and time
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        const now = new Date();

        // Validate times
        if (startDateTime < now) {
            setError('Start time must be in the future');
            setCreating(false);
            return;
        }

        if (endDateTime <= startDateTime) {
            setError('End time must be after start time');
            setCreating(false);
            return;
        }

        const timeDiff = (endDateTime - startDateTime) / (1000 * 60 * 60); // difference in hours
        if (timeDiff < 3) {
            setError('Auction must run for at least 3 hours');
            setCreating(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8082/api/v1/auctions/claims/${claimId}/create-auction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    startingPrice: itemDetails.startingPrice,
                    reservePrice: itemDetails.reservePrice,
                    bidIncrement: itemDetails.bidIncrement,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString()
                })
            });

            if (response.ok) {
                alert('Auction created successfully!');
                navigate('auctions');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to create auction');
            }
        } catch (err) {
            console.error('Error creating auction:', err);
            setError('Network error. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (error && !claim && !itemDetails) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('claims')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                    >
                        Back to Claims
                    </button>
                </div>
            </div>
        );
    }

    if (!claim || !itemDetails) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Claim or item not found</p>
                <button
                    onClick={() => navigate('claims')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                    Back to Claims
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Create Auction</h1>
                <button
                    onClick={() => navigate('claims')}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                >
                    ← Back
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Item Information</h3>
                <p className="text-sm text-blue-800"><span className="font-medium">Name:</span> {itemDetails.name}</p>
                <p className="text-sm text-blue-800"><span className="font-medium">Description:</span> {itemDetails.description}</p>
                <p className="text-sm text-blue-800"><span className="font-medium">Category:</span> {itemDetails.category}</p>
                <p className="text-sm text-blue-800"><span className="font-medium">Condition:</span> {itemDetails.condition}</p>
                <div className="mt-2 pt-2 border-t border-blue-300">
                    <p className="text-sm text-blue-800"><span className="font-medium">Starting Price:</span> ${itemDetails.startingPrice}</p>
                    <p className="text-sm text-blue-800"><span className="font-medium">Reserve Price:</span> ${itemDetails.reservePrice}</p>
                    <p className="text-sm text-blue-800"><span className="font-medium">Bid Increment:</span> ${itemDetails.bidIncrement}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auction Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="Enter a catchy title for your auction"
                    />
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Date & Time</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                /* Tailwind appearance-auto to allow native indicator, plus inline styles for cross-browser fallback */
                                className="appearance-auto w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ appearance: 'auto', WebkitAppearance: 'auto', MozAppearance: 'auto' }}
                                step="300" /* 5-minute steps */
                                aria-label="Auction start time"
                                required
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">⏰ Must be in the future</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">End Date & Time</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="appearance-auto w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ appearance: 'auto', WebkitAppearance: 'auto', MozAppearance: 'auto' }}
                                step="300"
                                aria-label="Auction end time"
                                required
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">⏱️ Must be at least 3 hours after start time</p>
                </div>

                {error && (
                    <div className="text-sm p-3 rounded bg-red-50 text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('claims')}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={creating}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                        {creating ? 'Creating...' : 'Create Auction'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateAuctionPage;
