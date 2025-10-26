import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import CreateItemPage from './pages/CreateItemPage';
import EditItemPage from './pages/EditItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import AuctionsPage from './pages/AuctionsPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import AuctionDetailsPage from './pages/AuctionDetailsPage';
import LiveAuctionPage from './pages/LiveAuctionPage';
import ClaimsPage from './pages/ClaimsPage';
import BrowseItemsPage from './pages/BrowseItemsPage';
import BrowseAuctionsPage from './pages/BrowseAuctionsPage';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [pageParams, setPageParams] = useState({});
    const [pageHistory, setPageHistory] = useState({});
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
            fetchUserProfile(savedToken);
        } else {
            setCurrentPage('auth');
        }
    }, []);

    const fetchUserProfile = async (authToken) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/users/me', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        }
    };

    const navigate = (page, params) => {
        console.log('Navigate called:', { page, params, currentPageParams: pageParams });

        setCurrentPage(page);

        // If params explicitly provided (even empty object), use them
        if (params !== undefined) {
            setPageHistory(prev => ({ ...prev, [page]: params }));
            setPageParams(params);
        }
        // If no params argument, try to restore from history
        else if (pageHistory[page]) {
            console.log('Restoring params from history:', pageHistory[page]);
            setPageParams(pageHistory[page]);
        }
        // Otherwise keep current params (don't clear)
        else {
            console.log('Keeping current params');
        }

        setSidebarOpen(false);
    };

    const handleLogin = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        fetchUserProfile(newToken);
        navigate('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('auth');
    };

    if (!token || currentPage === 'auth') {
        return <AuthPage onLogin={handleLogin} />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage user={user} navigate={navigate} />;
            case 'items':
                return <ItemsPage token={token} navigate={navigate} />;
            case 'create-item':
                return <CreateItemPage token={token} navigate={navigate} />;
            case 'edit-item':
                return <EditItemPage token={token} navigate={navigate} itemId={pageParams.itemId} />;
            case 'item-details':
                return <ItemDetailsPage token={token} navigate={navigate} itemId={pageParams.itemId} />;
            case 'browse-items':
                return <BrowseItemsPage token={token} user={user} navigate={navigate} />;
            case 'auctions':
                return <AuctionsPage token={token} navigate={navigate} />;
            case 'create-auction':
                return <CreateAuctionPage token={token} navigate={navigate} claimId={pageParams.claimId} />;
            case 'auction-details':
                return <AuctionDetailsPage token={token} navigate={navigate} auctionId={pageParams.auctionId} />;
            case 'live-auction':
                return <LiveAuctionPage token={token} navigate={navigate} auctionId={pageParams.auctionId} />;
            case 'browse-auctions':
                return <BrowseAuctionsPage token={token} navigate={navigate} />;
            case 'claims':
                return <ClaimsPage token={token} navigate={navigate} user={user} />;
            default:
                return <DashboardPage user={user} navigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} onLogout={handleLogout} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    navigate={navigate}
                    currentPage={currentPage}
                    user={user}
                />

                <main className="flex-1 p-6 lg:ml-64">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default App;