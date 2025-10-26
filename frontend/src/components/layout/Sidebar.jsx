function Sidebar({ isOpen, onClose, navigate, currentPage, user }) {
    const isAuctioneer = user?.roles?.some(role => role === 'ROLE_AUCTIONEER');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'browse-auctions', label: 'Browse Auctions', icon: '🔍' },
        { id: 'browse-items', label: 'Browse Items', icon: '📦' },
        { id: 'items', label: 'My Items', icon: '📋' },
        { id: 'auctions', label: 'My Auctions', icon: '⚡' },
    ];

    if (isAuctioneer) {
        menuItems.push({ id: 'claims', label: 'My Claims', icon: '🎯' });
    }

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed lg:fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 mt-[57px]`}
            >
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors ${
                                currentPage === item.id
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;