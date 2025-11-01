import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, User } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { auctionAPI, itemAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

const ItemClaimsPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [item, setItem] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        claim: null,
        approve: true,
    });
    const [reviewMessage, setReviewMessage] = useState('');
    const [reviewing, setReviewing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [itemId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [itemRes, claimsRes] = await Promise.all([
                itemAPI.getMyItemDetails(itemId),
                auctionAPI.listClaimsForItem(itemId),
            ]);
            setItem(itemRes.data);
            setClaims(claimsRes.data || []);
        } catch (error) {
            toast.error('Failed to load claims');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = (claim, approve) => {
        setReviewModal({ isOpen: true, claim, approve });
        setReviewMessage('');
    };

    const closeReviewModal = () => {
        setReviewModal({ isOpen: false, claim: null, approve: true });
        setReviewMessage('');
    };

    const handleReviewClaim = async () => {
        try {
            setReviewing(true);
            await auctionAPI.reviewClaim(reviewModal.claim.id, {
                approve: reviewModal.approve,
                sellerMessage: reviewMessage,
            });
            toast.success(`Claim ${reviewModal.approve ? 'approved' : 'rejected'} successfully!`);
            closeReviewModal();
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Failed to review claim');
        } finally {
            setReviewing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Background />
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/seller/my-items')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to My Items
                    </Button>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        Claims for: {item?.name}
                    </h1>
                    <p className="text-white/60">
                        Review and respond to auctioneer claims
                    </p>
                </div>

                {/* Item Summary */}
                <div className="glass rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-white/60 text-sm mb-1">Starting Price</p>
                            <p className="text-xl font-bold text-white">
                                {formatPrice(item?.startingPrice)}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/60 text-sm mb-1">Reserve Price</p>
                            <p className="text-xl font-bold text-white">
                                {formatPrice(item?.reservePrice)}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/60 text-sm mb-1">Bid Increment</p>
                            <p className="text-xl font-bold text-white">
                                {formatPrice(item?.bidIncrement)}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/60 text-sm mb-1">Status</p>
                            <Badge variant="approved">{item?.status}</Badge>
                        </div>
                    </div>
                </div>

                {/* Claims List */}
                {claims.length === 0 ? (
                    <div className="glass rounded-2xl">
                        <EmptyState
                            icon={User}
                            title="No claims yet"
                            description="Auctioneers haven't claimed this item yet. They will appear here once they do."
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {claims.map((claim, index) => (
                            <motion.div
                                key={claim.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-2xl p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <User className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">
                                                Auctioneer ID: {claim.auctioneerId}
                                            </h3>
                                            <p className="text-white/60 text-sm">
                                                Claimed on {new Date(claim.claimedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="pending">PENDING</Badge>
                                </div>

                                {/* Auctioneer's Message */}
                                <div className="glass rounded-xl p-4 mb-4">
                                    <p className="text-white/60 text-sm mb-2">Message from Auctioneer:</p>
                                    <p className="text-white">
                                        {claim.auctioneerMessage || 'No message provided'}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => openReviewModal(claim, true)}
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="flex-1"
                                        onClick={() => openReviewModal(claim, false)}
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
                title={reviewModal.approve ? 'Approve Claim' : 'Reject Claim'}
                size="md"
            >
                <div className="space-y-6">
                    <div className={`glass rounded-xl p-4 ${
                        reviewModal.approve
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                    }`}>
                        <p className={reviewModal.approve ? 'text-green-300' : 'text-red-300'}>
                            {reviewModal.approve
                                ? 'By approving this claim, the auctioneer will be able to create an auction for your item.'
                                : 'Rejecting this claim will notify the auctioneer that you declined their request.'}
                        </p>
                    </div>

                    <Textarea
                        label={`Message to Auctioneer ${reviewModal.approve ? '(Optional)' : '(Required)'}`}
                        placeholder={reviewModal.approve
                            ? 'Add a message for the auctioneer...'
                            : 'Please explain why you are rejecting this claim...'}
                        value={reviewMessage}
                        onChange={(e) => setReviewMessage(e.target.value)}
                        rows={6}
                    />

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
                            onClick={handleReviewClaim}
                            isLoading={reviewing}
                            disabled={reviewing}
                        >
                            {reviewModal.approve ? 'Approve Claim' : 'Reject Claim'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ItemClaimsPage;