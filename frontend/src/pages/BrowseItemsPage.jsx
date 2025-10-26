import {useEffect, useState} from "react";

function BrowseItemsPage({ token, user, navigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);

    const isAuctioneer = user?.roles?.includes('ROLE_AUCTIONEER');

    useEffect(() => {
        if (isAuctioneer) {
            fetchItems();
        } else {
            setLoading(false);
        }
    }, [isAuctioneer]);

    const fetchItems = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/v1/items/listed-for-claims', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (itemId, ownerId) => {
        setClaiming(itemId);
        const message = prompt('Enter a message for the seller:');
        if (!message) {
            setClaiming(null);
            return;
        }

        try {
            const response = await fetch('http://localhost:8082/api/v1/auctions/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    itemId,
                    itemOwnerId: ownerId,
                    auctioneerMessage: message
                })
            });

            if (response.ok) {
                alert('Claim submitted successfully!');
                fetchItems();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to claim item');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setClaiming(null);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    // Show message for non-auctioneers
    if (!isAuctioneer) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-8 text-center">
                    <div className="text-6xl mb-4">🎤</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Auctioneer Access Required</h2>
                    <p className="text-gray-700 mb-6">
                        You need to be an auctioneer to claim items for auction.
                        Auctioneers can browse available items and create exciting auctions for buyers!
                    </p>
                    <div className="bg-white rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                        <h3 className="font-semibold text-gray-900 mb-3">Benefits of becoming an auctioneer:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start">
                                <span className="mr-2">✨</span>
                                <span>Claim and auction items from sellers</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">💰</span>
                                <span>Earn from successful auctions</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">📊</span>
                                <span>Build your auctioneer reputation</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">🏆</span>
                                <span>Manage your own auction events</span>
                            </li>
                        </ul>
                    </div>
                    <button
                        onClick={() => navigate('dashboard')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium transition-colors"
                    >
                        Go to Dashboard
                    </button>
                    <p className="text-sm text-gray-600 mt-4">
                        Contact support to request auctioneer access
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Items to Claim</h1>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600">No items available for claiming</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.itemId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                <div className="space-y-1 text-sm mb-4">
                                    <p className="text-gray-700">Category: <span className="font-semibold">{item.category}</span></p>
                                    <p className="text-gray-700">Condition: <span className="font-semibold">{item.condition}</span></p>
                                    <p className="text-gray-700">Starting: <span className="font-semibold">${item.startingPrice}</span></p>
                                </div>
                                <button
                                    onClick={() => handleClaim(item.itemId, item.itemOwnerId)}
                                    disabled={claiming === item.itemId}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
                                >
                                    {claiming === item.itemId ? 'Claiming...' : 'Claim Item'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default BrowseItemsPage;