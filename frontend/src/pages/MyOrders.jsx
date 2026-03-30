import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Search, ExternalLink, Plus, X, ShoppingCart, Loader2, Download } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import { generateInvoicePDF } from '../utils/invoiceGenerator';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [detailOrder, setDetailOrder] = useState(null);
    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/my');
            setOrders(res.data);
        } catch {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setInventory(res.data);
        } catch {
            console.error('Failed to fetch inventory');
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchInventory();
    }, []);

    const handleAddItem = (inventoryItem) => {
        const existing = selectedItems.find(i => i.id === inventoryItem.id);
        if (existing) {
            setSelectedItems(selectedItems.map(i => i.id === inventoryItem.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setSelectedItems([...selectedItems, { ...inventoryItem, quantity: 1 }]);
        }
    };

    const handleRemoveItem = (id) => {
        setSelectedItems(selectedItems.filter(i => i.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setSelectedItems(selectedItems.map(i => {
            if (i.id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (selectedItems.length === 0) return;
        setSubmitting(true);
        try {
            await api.post('/orders', {
                items: selectedItems,
                subtotal: subtotal.toFixed(2),
                notes: 'Online order via customer portal'
            });
            await fetchOrders();
            setShowModal(false);
            setSelectedItems([]);
        } catch {
            console.error('Failed to place order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const statusStyle = {
        'pending': 'bg-amber-100 text-amber-700',
        'approved': 'bg-blue-100 text-blue-700',
        'shipped': 'bg-indigo-100 text-indigo-700',
        'delivered': 'bg-green-100 text-green-700',
        'cancelled': 'bg-red-100 text-red-700',
    };

    const openDetail = async (id) => {
        try {
            const res = await api.get(`/orders/${id}`);
            setDetailOrder({ ...res.data, invoice_number: res.data.order_number }); // reuse same modal structure
        } catch {
            alert('Failed to load order details');
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/orders/${id}`);
            generateInvoicePDF({ ...res.data, invoice_number: res.data.order_number });
        } catch {
            alert('Failed to generate PDF');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage your order history.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100"
                >
                    <Plus className="h-4 w-4" /> New Order
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
                        <p className="font-medium">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No orders yet</h3>
                        <p className="text-slate-500 mb-6">You haven't placed any orders from our inventory yet.</p>
                        <button onClick={() => setShowModal(true)} className="text-blue-600 font-bold hover:underline">Place your first order</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Total</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{order.order_number}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusStyle[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">₹{Number(order.subtotal).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => openDetail(order.id)}
                                                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-tighter"
                                                    title="View Details"
                                                >
                                                    View <ExternalLink className="h-3.5 w-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDownload(order.id)}
                                                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-tighter"
                                                    title="Download Order Copy"
                                                >
                                                    PDF <Download className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* New Order Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex overflow-hidden h-[80vh]">
                        {/* Left: Inventory Selection */}
                        <div className="flex-1 flex flex-col border-r border-slate-100 bg-slate-50/50">
                            <div className="p-6 border-b border-slate-100 bg-white">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" /> Browse Inventory
                                </h3>
                                <div className="mt-4 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" placeholder="Find materials..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {inventory.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all flex items-center justify-between group">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{item.name}</h4>
                                            <p className="text-xs text-slate-500">{item.category} • ₹{Number(item.price).toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAddItem(item)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Cart Summary */}
                        <div className="w-80 flex flex-col bg-white">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-900">Your Order</h3>
                                <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {selectedItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                                        <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                                        <p className="text-xs">Cart is empty</p>
                                    </div>
                                ) : (
                                    selectedItems.map(item => (
                                        <div key={item.id} className="flex flex-col gap-2 border-b border-slate-50 pb-4">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</span>
                                                <button onClick={() => handleRemoveItem(item.id)} className="text-slate-300 hover:text-red-500"><X className="h-4 w-4" /></button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-xs font-bold">-</button>
                                                    <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-xs font-bold">+</button>
                                                </div>
                                                <span className="text-xs font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-6 bg-slate-50 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total cost</span>
                                    <span className="text-xl font-black text-slate-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={handleSubmitOrder}
                                    disabled={submitting || selectedItems.length === 0}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DetailModal 
                isOpen={!!detailOrder} 
                onClose={() => setDetailOrder(null)} 
                title={detailOrder ? `Order: ${detailOrder.order_number}` : ''}
                data={detailOrder}
                type="invoice" // reuse invoice layout for line items
            />
        </div>
    );
};

export default MyOrders;
