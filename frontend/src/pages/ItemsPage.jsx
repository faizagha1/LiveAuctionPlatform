import {useEffect, useState} from "react";

function ItemsPage({ token, navigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/v2/items/my-items', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
                <button
                    onClick={() => navigate('create-item')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                    + Create Item
                </button>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600 mb-4">No items yet</p>
                    <button
                        onClick={() => navigate('create-item')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                        Create Your First Item
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-700">Starting: <span className="font-semibold">${item.startingPrice}</span></p>
                                    <p className="text-gray-700">Reserve: <span className="font-semibold">${item.reservePrice}</span></p>
                                </div>
                                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          item.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
                                <button
                                    onClick={() => navigate('item-details', { itemId: item.id })}
                                    className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => navigate('edit-item', { itemId: item.id })}
                                    className="flex-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default ItemsPage;