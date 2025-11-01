import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gavel, Calendar, Package, DollarSign } from 'lucide-react'; // Added icons
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { auctionAPI, itemAPI } from '../../lib/api'; // Import itemAPI
import { formatPrice } from '../../lib/utils'; // Import formatPrice

const CreateAuctionPage = () => {
    const navigate = useNavigate();
    // ⭐️ FIXED: Get both IDs from the URL
    const { claimId, itemId } = useParams();
    const toast = useToast();

    // ⭐️ RENAMED: 'loading' to 'formLoading' for clarity
    const [formLoading, setFormLoading] = useState(false);

    // ⭐️ NEW: State for page load and item details
    const [pageLoading, setPageLoading] = useState(true);
    const [item, setItem] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        startTime: '',
        endTime: '',
        // ⭐️ ADDED: These will be populated from the item fetch
        startingPrice: null,
        reservePrice: null,
        bidIncrement: null,
    });

    const [errors, setErrors] = useState({});

    // ⭐️ NEW: useEffect to fetch item details on page load
    useEffect(() => {
        const fetchItemData = async () => {
            if (!itemId) {
                toast.error("Invalid item. Returning to claims.");
                navigate('/auctioneer/my-claims');
                return;
            }
            try {
                setPageLoading(true);
                const res = await itemAPI.getPublicItemDetails(itemId);
                const itemData = res.data;
                setItem(itemData);

                // Pre-populate formData with item data
                setFormData(prev => ({
                    ...prev,
                    title: `Auction for ${itemData.name}`, // Suggest a title
                    startingPrice: itemData.startingPrice,
                    reservePrice: itemData.reservePrice,
                    bidIncrement: itemData.bidIncrement,
                }));
            } catch (error) {
                toast.error(error.message || 'Failed to load item details');
                navigate('/auctioneer/my-claims');
            } finally {
                setPageLoading(false);
            }
        };
        fetchItemData();
    }, [itemId, navigate, toast]);

    // Set minimum start time to now + 1 hour
    const getMinStartTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return now.toISOString().slice(0, 16);
    };

    // Set minimum end time to start time + 3 hours
    const getMinEndTime = () => {
        if (!formData.startTime) return '';
        const start = new Date(formData.startTime);
        start.setHours(start.getHours() + 3);
        return start.toISOString().slice(0, 16);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        // ... (validation logic is unchanged)
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Auction title is required';
        }

        if (!formData.startTime) {
            newErrors.startTime = 'Start time is required';
        }

        if (!formData.endTime) {
            newErrors.endTime = 'End time is required';
        }

        if (formData.startTime && formData.endTime) {
            const start = new Date(formData.startTime);
            const end = new Date(formData.endTime);
            const diff = (end - start) / 1000 / 60 / 60; // hours

            if (diff < 3) {
                newErrors.endTime = 'Auction must be at least 3 hours long';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ⭐️ FIXED: handleSubmit now sends all required fields
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setFormLoading(true);

            await auctionAPI.createAuction(claimId, {
                // Fields from user input
                title: formData.title,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),

                // Fields from fetched item data
                startingPrice: formData.startingPrice,
                reservePrice: formData.reservePrice,
                bidIncrement: formData.bidIncrement,
            });

            toast.success('Auction created successfully!');
            navigate('/auctioneer/my-auctions');
        } catch (error)
        {
            toast.error(error.message || 'Failed to create auction');
        } finally {
            setFormLoading(false);
        }
    };

    // ⭐️ NEW: Show a loading spinner while fetching item details
    if (pageLoading) {
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
                        onClick={() => navigate('/auctioneer/my-claims')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to My Claims
                    </Button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Gavel className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Create Auction
                            </h1>
                            <p className="text-white/60">
                                Set up your auction details and schedule
                            </p>
                        </div>
                    </div>
                </div>

                {/* ⭐️ NEW: Item Summary Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-6 mb-8"
                >
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <Package className="w-6 h-6 text-purple-400" />
                        Item Details
                    </h3>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span className="text-white/60">Item Name</span>
                            <span className="text-white font-medium">{item?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/60">Category</span>
                            <span className="text-white font-medium">{item?.category}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/60">Condition</span>
                            <span className="text-white font-medium">{item?.condition}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 glass rounded-xl p-4">
                        <div>
                            <p className="text-white/60 text-xs mb-1">Starting Price</p>
                            <p className="text-lg font-bold text-white">{formatPrice(item?.startingPrice)}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs mb-1">Reserve Price</p>
                            <p className="text-lg font-bold text-green-400">{formatPrice(item?.reservePrice)}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs mb-1">Bid Increment</p>
                            <p className="text-lg font-bold text-white">{formatPrice(item?.bidIncrement)}</p>
                        </div>
                    </div>
                    <p className="text-blue-300 text-sm mt-4 bg-blue-500/10 p-3 rounded-lg">
                        These prices were set by the item owner and cannot be changed.
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }} // Added delay
                    className="glass rounded-2xl p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <Input
                            label="Auction Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Premium Vintage Rolex Auction"
                            icon={Gavel}
                            error={errors.title}
                            disabled={formLoading} // Use formLoading
                        />

                        {/* Start Time */}
                        <Input
                            label="Start Time"
                            name="startTime"
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={handleChange}
                            min={getMinStartTime()}
                            icon={Calendar}
                            error={errors.startTime}
                            disabled={formLoading} // Use formLoading
                        />

                        {/* End Time */}
                        <Input
                            label="End Time (Must be at least 3 hours after start)"
                            name="endTime"
                            type="datetime-local"
                            value={formData.endTime}
                            onChange={handleChange}
                            min={getMinEndTime()}
                            icon={Calendar}
                            error={errors.endTime}
                            disabled={formLoading} // Use formLoading
                        />

                        {/* Info Boxes */}
                        <div className="space-y-4">
                            {/* ... (info boxes are unchanged) ... */}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => navigate('/auctioneer/my-claims')}
                                disabled={formLoading} // Use formLoading
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                isLoading={formLoading} // Use formLoading
                                disabled={formLoading} // Use formLoading
                            >
                                <Gavel className="w-5 h-5" />
                                Create Auction
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateAuctionPage;