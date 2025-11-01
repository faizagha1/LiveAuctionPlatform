import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Package } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { adminItemAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

const ItemReviewPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        item: null,
        approve: true,
    });
    const [reviewing, setReviewing] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await adminItemAPI.getItemsForReview();

            // Defensively check for array to prevent .map() crash
            if (response.data && Array.isArray(response.data.content)) {
                setItems(response.data.content);
            } else if (Array.isArray(response.data)) {
                setItems(response.data);
            } else {
                console.warn("API (getItemsForReview) did not return an array:", response.data);
                setItems([]);
            }
        } catch (error) {
            toast.error('Failed to load items');
            console.error(error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = (item, approve) => {
        setReviewModal({ isOpen: true, item, approve });
    };

    const closeReviewModal = () => {
        setReviewModal({ isOpen: false, item: null, approve: true });
    };

    const handleReviewItem = async () => {
        if (!reviewModal.item?.id) {
            toast.error("Cannot review item: Missing item ID.");
            return;
        }

        try {
            setReviewing(true);

            // This is the correct DTO based on your backend code
            const reviewData = {
                response: reviewModal.approve ? "APPROVED" : "REJECTED"
            };

            // Call the API to submit the review
            await adminItemAPI.reviewItem(reviewModal.item.id, reviewData);

            toast.success(`Item ${reviewModal.approve ? 'approved' : 'rejected'} successfully!`);
            closeReviewModal();
            fetchItems(); // Refresh the list after review
        } catch (error) {
            toast.error(error.message || 'Failed to review item');
        } finally {
            setReviewing(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Button>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        Item Review Queue
                    </h1>
                    <p className="text-white/60">
                        Review and approve items for the marketplace
                    </p>
                </div>

                {/* Items List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="glass rounded-2xl">
                        <EmptyState
                            icon={Package}
                            title="All caught up!"
                            description="No items pending review at the moment"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-2xl p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Badge variant="pending">PENDING REVIEW</Badge>
                                    <span className="text-white/60 text-sm">{item.category}</span>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{item.name}</h3>

                                <p className="text-white/60 text-sm mb-4 line-clamp-3">
                                    {item.description}
                                </p>

                                {/* Item Details */}
                                <div className="glass rounded-xl p-4 mb-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-white/60 text-sm">Condition</span>
                                        <span className="text-white text-sm font-medium">
                                            {item.condition?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60 text-sm">Starting Price</span>
                                        <span className="text-white text-sm font-medium">
                                            {formatPrice(item.startingPrice)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60 text-sm">Reserve Price</span>
                                        <span className="text-white text-sm font-medium">
                                            {formatPrice(item.reservePrice)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60 text-sm">Bid Increment</span>
                                        <span className="text-white text-sm font-medium">
                                            {formatPrice(item.bidIncrement)}
                                        </span>
                                    </div>
                                </div>

                                {/* Seller Info */}
                                <div className="text-xs text-white/60 mb-4">
                                    Submitted by: {item.ownerId}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => openReviewModal(item, true)}
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="flex-1"
                                        onClick={() => openReviewModal(item, false)}
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <Dialog
                isOpen={reviewModal.isOpen}
                onClose={closeReviewModal}
                title={reviewModal.approve ? 'Approve Item' : 'Reject Item'}
                size="md"
            >
                {reviewModal.item && (
                    <div className="space-y-6">
                        {/* Item Summary */}
                        <div className="glass rounded-xl p-4">
                            <h3 className="text-lg font-bold text-white mb-2">
                                {reviewModal.item.name}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-white/60">Category</p>
                                    <p className="text-white font-medium">{reviewModal.item.category}</p>
                                </div>
                                <div>
                                    <p className="text-white/60">Condition</p>
                                    <p className="text-white font-medium">
                                        {reviewModal.item.condition?.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`glass rounded-xl p-4 ${
                            reviewModal.approve
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                        }`}>
                            <p className={reviewModal.approve ? 'text-green-300' : 'text-red-300'}>
                                {reviewModal.approve
                                    ? 'This item will be approved and made available in the marketplace for auctioneers to claim.'
                                    : 'This item will be rejected and the seller will be notified.'}
                            </p>
                        </div>

                        {/* Textarea for notes removed as it's not in the backend DTO */}

                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={closeReviewModal}
                                disabled={reviewing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={reviewModal.approve ? 'primary' : 'danger'}
                                className="flex-1"
                                onClick={handleReviewItem}
                                isLoading={reviewing}
                                disabled={reviewing}
                            >
                                {reviewModal.approve ? 'Approve Item' : 'Reject Item'}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default ItemReviewPage;

