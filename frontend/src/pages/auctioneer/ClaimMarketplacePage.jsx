import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Filter, Sparkles, DollarSign, Tag } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Dialog from '../../components/ui/Dialog';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { itemAPI, auctionAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { ITEM_CATEGORIES } from '../../lib/constants';

const ClaimMarketplacePage = () => {
    const toast = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Claim Modal State
    const [claimModal, setClaimModal] = useState({
        isOpen: false,
        item: null,
    });
    const [claimMessage, setClaimMessage] = useState('');
    const [claiming, setClaiming] = useState(false);

    // ⭐️ ADDED: Manages loading state *inside* the modal
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await itemAPI.listItemsForClaims();
            setItems(response.data.content || []);
        } catch (error) {
            toast.error('Failed to load marketplace items');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ⭐️ FIXED: Fetches full details before opening modal
    const openClaimModal = async (partialItem) => {
        setClaimMessage('');
        setModalLoading(true);
        // Open the modal frame immediately in a loading state
        setClaimModal({ isOpen: true, item: null });

        try {
            // Fetch the full public details
            const response = await itemAPI.getPublicItemDetails(partialItem.id);
            // Now, populate the modal with the *full* item details
            setClaimModal({ isOpen: true, item: response.data });
        } catch (error) {
            toast.error(error.message || 'Failed to load item details');
            closeClaimModal(); // Close modal on error
        } finally {
            setModalLoading(false);
        }
    };

    const closeClaimModal = () => {
        setClaimModal({ isOpen: false, item: null });
        setClaimMessage('');
    };

    // ⭐️ FIXED: Uses correct API signature and field names
    const handleClaimItem = async () => {
        if (!claimMessage.trim()) {
            toast.error('Please add a message to your claim');
            return;
        }

        try {
            setClaiming(true);

            // Use the new API signature and correct field names
            // from ItemResponsePublic (itemId, itemOwnerId)
            await auctionAPI.claimItem(
                claimModal.item.itemId, // 1. Pass itemId for the URL
                {                     // 2. Pass the payload
                    itemOwnerId: claimModal.item.itemOwnerId,
                    auctioneerMessage: claimMessage,
                }
            );

            toast.success('Claim submitted successfully!');
            closeClaimModal();
            fetchItems(); // Refresh to remove claimed item
        } catch (error) {
            toast.error(error.message || 'Failed to submit claim');
        } finally {
            setClaiming(false);
        }
    };

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        // ⭐️ REMOVED: item.description is not in ItemResponsePartial
        // || item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !filterCategory || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white">Claim Marketplace</h1>
                            <p className="text-white/60">Browse approved items and claim them for auction</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Search items by name..." // ⭐️ UPDATED: Removed description
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                        <Select
                            options={ITEM_CATEGORIES}
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            icon={Filter}
                        />
                    </div>
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="glass rounded-2xl">
                        <EmptyState
                            icon={Package}
                            title="No items available"
                            description="Check back later for new items to claim"
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
                                className="glass rounded-2xl overflow-hidden group"
                            >
                                {/* Item Header */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <Badge variant="approved">AVAILABLE</Badge>
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Sparkles className="w-4 h-4" />
                                            <span className="text-xs font-medium">NEW</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                        {item.name}
                                    </h3>

                                    {/* ⭐️ REMOVED: item.description is not in ItemResponsePartial */}
                                    {/* <p className="text-white/60 text-sm mb-4 line-clamp-3">
                                        {item.description}
                                    </p> */}

                                    {/* Item Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/60 text-sm flex items-center gap-2">
                                                <Tag className="w-4 h-4" />
                                                Category
                                            </span>
                                            <span className="text-white text-sm font-medium">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/60 text-sm flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                Condition
                                            </span>
                                            <span className="text-white text-sm font-medium">
                                                {item.condition?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="glass rounded-xl p-4 mb-4">
                                        <div>
                                            <p className="text-white/60 text-xs mb-1">Starting Price</p>
                                            <p className="text-lg font-bold text-white">
                                                {formatPrice(item.startingPrice)}
                                            </p>
                                        </div>
                                        {/* ⭐️ REMOVED: Reserve Price is not in ItemResponsePartial */}
                                    </div>

                                    {/* ⭐️ REMOVED: Bid Increment is not in ItemResponsePartial */}

                                    {/* Claim Button */}
                                    <Button
                                        variant="primary"
                                        className="w-full mt-4" // Added margin-top
                                        onClick={() => openClaimModal(item)}
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Claim This Item
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Claim Modal */}
            <Dialog
                isOpen={claimModal.isOpen}
                onClose={closeClaimModal}
                title="Claim Item for Auction"
                size="md"
            >
                {/* ⭐️ ADDED: Loading spinner for modal content */}
                {modalLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : claimModal.item && (
                    <div className="space-y-6">
                        {/* Item Summary */}
                        <div className="glass rounded-xl p-4">
                            <h3 className="text-lg font-bold text-white mb-2">
                                {claimModal.item.name}
                            </h3>
                            {/* ⭐️ FIXED: This data is now available from getPublicItemDetails */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-white/60">Starting Price</p>
                                    <p className="text-white font-medium">
                                        {formatPrice(claimModal.item.startingPrice)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/60">Reserve Price</p>
                                    <p className="text-white font-medium">
                                        {formatPrice(claimModal.item.reservePrice)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Message to Seller */}
                        <Textarea
                            label="Message to Seller"
                            placeholder="Introduce yourself and explain why you'd be a great auctioneer for this item..."
                            value={claimMessage}
                            onChange={(e) => setClaimMessage(e.target.value)}
                            rows={6}
                        />

                        <div className="glass bg-blue-500/10 border-blue-500/30 rounded-xl p-4">
                            <p className="text-blue-300 text-sm">
                                <strong>Note:</strong> The seller will review your claim and decide whether to approve it.
                                Make sure to provide a compelling message!
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={closeClaimModal}
                                disabled={claiming}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleClaimItem}
                                isLoading={claiming}
                                disabled={claiming}
                            >
                                Submit Claim
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default ClaimMarketplacePage;