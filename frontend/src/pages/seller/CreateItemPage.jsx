import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Package } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';
import { itemAPI } from '../../lib/api';
import { ITEM_CATEGORIES, ITEM_CONDITIONS } from '../../lib/constants';

const CreateItemPage = () => {
    const navigate = useNavigate();
    const { itemId } = useParams();
    const toast = useToast();
    const isEditMode = !!itemId;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        condition: '',
        startingPrice: '',
        reservePrice: '',
        bidIncrement: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchItemDetails();
        }
    }, [itemId]);

    const fetchItemDetails = async () => {
        try {
            setLoading(true);
            const response = await itemAPI.getMyItemDetails(itemId);
            const item = response.data;
            setFormData({
                name: item.name,
                description: item.description,
                category: item.category,
                condition: item.condition,
                startingPrice: item.startingPrice,
                reservePrice: item.reservePrice,
                bidIncrement: item.bidIncrement,
            });
        } catch (error) {
            toast.error('Failed to load item details');
            navigate('/seller/my-items');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Item name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (!formData.condition) {
            newErrors.condition = 'Please select item condition';
        }

        if (!formData.startingPrice || formData.startingPrice <= 0) {
            newErrors.startingPrice = 'Starting price must be greater than 0';
        }

        if (!formData.reservePrice || formData.reservePrice <= 0) {
            newErrors.reservePrice = 'Reserve price must be greater than 0';
        }

        if (parseFloat(formData.startingPrice) >= parseFloat(formData.reservePrice)) {
            newErrors.reservePrice = 'Reserve price must be higher than starting price';
        }

        if (!formData.bidIncrement || formData.bidIncrement <= 0) {
            newErrors.bidIncrement = 'Bid increment must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            const payload = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                condition: formData.condition,
                startingPrice: parseFloat(formData.startingPrice),
                reservePrice: parseFloat(formData.reservePrice),
                bidIncrement: parseFloat(formData.bidIncrement),
            };

            if (isEditMode) {
                await itemAPI.updateItem(itemId, payload);
                toast.success('Item updated successfully!');
            } else {
                await itemAPI.createItem(payload);
                toast.success('Item created successfully!');
            }

            navigate('/seller/my-items');
        } catch (error) {
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} item`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
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
                        {isEditMode ? 'Edit Item' : 'Create New Item'}
                    </h1>
                    <p className="text-white/60">
                        {isEditMode ? 'Update your item details' : 'Add a new item to your inventory'}
                    </p>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Item Name */}
                        <Input
                            label="Item Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Vintage Rolex Watch"
                            icon={Package}
                            error={errors.name}
                            disabled={loading}
                        />

                        {/* Description */}
                        <Textarea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide detailed description of your item..."
                            rows={4}
                            error={errors.description}
                            disabled={loading}
                        />

                        {/* Category & Condition */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                options={ITEM_CATEGORIES}
                                error={errors.category}
                                disabled={loading}
                            />

                            <Select
                                label="Condition"
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                options={ITEM_CONDITIONS}
                                error={errors.condition}
                                disabled={loading}
                            />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                label="Starting Price ($)"
                                name="startingPrice"
                                type="number"
                                step="0.01"
                                value={formData.startingPrice}
                                onChange={handleChange}
                                placeholder="100.00"
                                error={errors.startingPrice}
                                disabled={loading}
                            />

                            <Input
                                label="Reserve Price ($)"
                                name="reservePrice"
                                type="number"
                                step="0.01"
                                value={formData.reservePrice}
                                onChange={handleChange}
                                placeholder="500.00"
                                error={errors.reservePrice}
                                disabled={loading}
                            />

                            <Input
                                label="Bid Increment ($)"
                                name="bidIncrement"
                                type="number"
                                step="0.01"
                                value={formData.bidIncrement}
                                onChange={handleChange}
                                placeholder="10.00"
                                error={errors.bidIncrement}
                                disabled={loading}
                            />
                        </div>

                        {/* Info Box */}
                        <div className="glass bg-blue-500/10 border-blue-500/30 rounded-xl p-4">
                            <p className="text-blue-300 text-sm">
                                <strong>Note:</strong> Items will be saved as drafts. You can submit them for admin approval when ready.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => navigate('/seller/my-items')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                isLoading={loading}
                                disabled={loading}
                            >
                                <Save className="w-5 h-5" />
                                {isEditMode ? 'Update Item' : 'Create Item'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateItemPage;