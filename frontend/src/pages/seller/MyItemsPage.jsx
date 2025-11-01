import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Package, DollarSign, TrendingUp, Search, Filter } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { itemAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { STATUS_BADGE_VARIANTS } from '../../lib/constants';

const MyItemsPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await itemAPI.listMyItems();
            setItems(response.data.content || []);
        } catch (error) {
            toast.error('Failed to load items');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkForApproval = async (itemId) => {
        try {
            await itemAPI.markForApproval(itemId);
            toast.success('Item submitted for approval!');
            fetchItems();
        } catch (error) {
            toast.error(error.message || 'Failed to submit item');
        }
    };

    // Calculate stats
    const stats = {
        total: items.length,
        draft: items.filter(i => i.status === 'DRAFT').length,
        approved: items.filter(i => i.status === 'APPROVED').length,
        pending: items.filter(i => i.status === 'PENDING_APPROVAL').length,
        totalValue: items.reduce((sum, i) => sum + (i.startingPrice || 0), 0),
    };

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">My Items</h1>
                        <p className="text-white/60">Manage your auction items</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/seller/create-item')}
                    >
                        <Plus className="w-5 h-5" />
                        Create Item
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Items"
                        value={stats.total}
                        icon={Package}
                    />
                    <StatCard
                        title="Draft"
                        value={stats.draft}
                        icon={Package}
                    />
                    <StatCard
                        title="Approved"
                        value={stats.approved}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Total Value"
                        value={formatPrice(stats.totalValue)}
                        icon={DollarSign}
                    />
                </div>

                {/* Filters */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                icon={Search}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_AUCTION'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                        filterStatus === status
                                            ? 'bg-purple-500 text-white'
                                            : 'glass text-white/60 hover:text-white'
                                    }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Items List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="glass rounded-2xl">
                        <EmptyState
                            icon={Package}
                            title="No items yet"
                            description="Create your first item to get started with auctions"
                            actionLabel="Create Item"
                            onAction={() => navigate('/seller/create-item')}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-2xl p-6 glass-hover"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Badge variant={STATUS_BADGE_VARIANTS[item.status]}>
                                        {item.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-white/60 text-sm">{item.category}</span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                                    {item.description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-white/60 text-xs">Starting Price</p>
                                        <p className="text-lg font-bold text-white">
                                            {formatPrice(item.startingPrice)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-xs">Reserve Price</p>
                                        <p className="text-lg font-bold text-white">
                                            {formatPrice(item.reservePrice)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {item.status === 'DRAFT' && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => navigate(`/seller/edit-item/${item.id}`)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleMarkForApproval(item.id)}
                                            >
                                                Submit for Approval
                                            </Button>
                                        </>
                                    )}
                                    {item.status === 'APPROVED' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => navigate(`/seller/item-claims/${item.id}`)}
                                        >
                                            View Claims
                                        </Button>
                                    )}
                                    {item.status === 'PENDING_APPROVAL' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            disabled
                                        >
                                            Awaiting Approval
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyItemsPage;