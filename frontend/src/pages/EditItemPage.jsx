import {useEffect, useState} from "react";

function EditItemPage({ token, navigate, itemId }) {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchItem();
    }, [itemId]);

    const fetchItem = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/v2/items/my-items/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFormData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch item:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:8081/api/v2/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('items');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update item');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!formData) {
        return <div className="text-center py-12">Item not found</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Item</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                        <select
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="NEW">New</option>
                            <option value="LIKE_NEW">Like New</option>
                            <option value="GOOD">Good</option>
                            <option value="FAIR">Fair</option>
                            <option value="POOR">Poor</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.startingPrice}
                            onChange={(e) => setFormData({ ...formData, startingPrice: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reserve Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.reservePrice}
                            onChange={(e) => setFormData({ ...formData, reservePrice: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bid Increment ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.bidIncrement}
                            onChange={(e) => setFormData({ ...formData, bidIncrement: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-sm p-3 rounded bg-red-50 text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('items')}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
export default EditItemPage;