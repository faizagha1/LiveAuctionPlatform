function DashboardPage({ user, navigate }) {
    // Change from role.name to just role (since roles are strings)
    const isAuctioneer = user?.roles?.some(role => role === 'ROLE_AUCTIONEER');
    const isSeller = user?.roles?.some(role => role === 'ROLE_SELLER');

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-3xl mb-2">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Auctions</h3>
                    <p className="text-sm text-gray-600 mb-4">Discover ongoing and upcoming auctions</p>
                    <button
                        onClick={() => navigate('browse-auctions')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                        View Auctions
                    </button>
                </div>

                {isSeller && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-3xl mb-2">📦</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">My Items</h3>
                        <p className="text-sm text-gray-600 mb-4">Manage your listed items</p>
                        <button
                            onClick={() => navigate('items')}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                        >
                            View Items
                        </button>
                    </div>
                )}

                {isAuctioneer && (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-3xl mb-2">🎯</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Claim Items</h3>
                            <p className="text-sm text-gray-600 mb-4">Browse and claim items to auction</p>
                            <button
                                onClick={() => navigate('browse-items')}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
                            >
                                Browse Items
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-3xl mb-2">⚡</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Auctions</h3>
                            <p className="text-sm text-gray-600 mb-4">Manage your created auctions</p>
                            <button
                                onClick={() => navigate('auctions')}
                                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
                            >
                                View Auctions
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-3">Welcome, {user?.username}!</h2>
                <p className="text-blue-800 mb-2">Your roles:</p>
                <div className="flex flex-wrap gap-2">
                    {user?.roles?.map((role, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {role.replace('ROLE_', '')}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;